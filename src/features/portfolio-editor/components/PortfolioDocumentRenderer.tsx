import { useAdminSession } from "@/features/main/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { DragDropIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Responsive,
  type Layout,
  type ResizeHandleAxis,
  type ResponsiveLayouts,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { defaultPortfolioDocument } from "../data/defaultPortfolio";
import {
  getPortfolioDocument,
  updatePortfolioDocument,
} from "../data/portfolio";
import { renderPortfolioBlock } from "../registry/blocks";
import type {
  PortfolioBreakpoint,
  PortfolioBlock,
  PortfolioDocument,
  PortfolioDocumentRecord,
  PortfolioGridItem,
  PortfolioLayouts,
} from "../types/portfolio";
import { EditorToolbar } from "./EditorToolbar";

const gridBreakpoints: Record<PortfolioBreakpoint, number> = {
  lg: 640,
  md: 480,
  sm: 0,
};

const gridColumns: Record<PortfolioBreakpoint, number> = {
  lg: 12,
  md: 6,
  sm: 1,
};

const gridRowHeight = 1;
const gridSectionGap = 16;

const gridMargins: Record<PortfolioBreakpoint, [number, number]> = {
  lg: [gridSectionGap, 0],
  md: [gridSectionGap, 0],
  sm: [0, 0],
};

const autoHeightBlockTypes = new Set<PortfolioBlock["type"]>([
  "about",
  "projects",
]);

const horizontalResizeHandles: ResizeHandleAxis[] = ["e", "w"];

interface AutoHeightMeasurement {
  height: number;
  rows: number;
}

type AutoHeightMeasurements = Partial<
  Record<
    PortfolioBreakpoint,
    Record<string, AutoHeightMeasurement>
  >
>;

type PortfolioSectionStyle = CSSProperties & {
  "--portfolio-section-height"?: string;
  "--portfolio-live-x"?: string;
  "--portfolio-live-y"?: string;
  "--portfolio-live-width"?: string;
  "--portfolio-live-offset-x"?: string;
  "--portfolio-live-offset-y"?: string;
};

interface AutoHeightContentProps {
  blockId: string;
  children: ReactNode;
  editingInset: number;
  onHeightChange: (blockId: string, height: number) => void;
}

function AutoHeightContent({
  blockId,
  children,
  editingInset,
  onHeightChange,
}: AutoHeightContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastReportedHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const measure = () => {
      const height = Math.ceil(content.scrollHeight + editingInset);

      if (lastReportedHeightRef.current === height) {
        return;
      }

      lastReportedHeightRef.current = height;
      onHeightChange(blockId, height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [blockId, editingInset, onHeightChange]);

  return (
    <div ref={contentRef} className="w-full">
      {children}
    </div>
  );
}

function rowsForHeight(height: number) {
  return Math.max(1, Math.ceil(height) + gridSectionGap);
}

function verticallyOverlaps(
  first: PortfolioGridItem,
  second: PortfolioGridItem,
) {
  return first.y < second.y + second.h &&
    first.y + first.h > second.y;
}

interface HorizontalSlot {
  x: number;
  w: number;
}

interface LayoutPlacement extends HorizontalSlot {
  i: string;
  y: number;
}

interface DragPreview extends LayoutPlacement {
  h: number;
  companions: LayoutPlacement[];
}

function findHorizontalSlot(
  layout: Layout,
  itemId: string,
  y: number,
  h: number,
  anchorColumn: number,
  columns: number,
): HorizontalSlot | null {
  const droppedItem = layout.find((item) => item.i === itemId);

  if (!droppedItem) {
    return null;
  }

  const candidate = { ...droppedItem, y, h };
  const occupiedRanges = layout
    .filter(
      (item) => item.i !== itemId && verticallyOverlaps(candidate, item),
    )
    .map((item) => ({
      start: Math.max(0, item.x),
      end: Math.min(columns, item.x + item.w),
    }))
    .sort((first, second) => first.start - second.start);
  const freeSlots: HorizontalSlot[] = [];
  let cursor = 0;

  for (const range of occupiedRanges) {
    if (range.start > cursor) {
      freeSlots.push({ x: cursor, w: range.start - cursor });
    }

    cursor = Math.max(cursor, range.end);
  }

  if (cursor < columns) {
    freeSlots.push({ x: cursor, w: columns - cursor });
  }

  const minimumWidth = droppedItem.minW ?? 1;
  const validSlots = freeSlots.filter((slot) => slot.w >= minimumWidth);

  if (validSlots.length === 0) {
    return null;
  }

  const selectedSlot = validSlots.find(
    (slot) =>
      anchorColumn >= slot.x && anchorColumn < slot.x + slot.w,
  ) ?? validSlots.reduce((closestSlot, slot) => {
    const closestDistance = Math.min(
      Math.abs(anchorColumn - closestSlot.x),
      Math.abs(anchorColumn - (closestSlot.x + closestSlot.w - 1)),
    );
    const slotDistance = Math.min(
      Math.abs(anchorColumn - slot.x),
      Math.abs(anchorColumn - (slot.x + slot.w - 1)),
    );

    return slotDistance < closestDistance ? slot : closestSlot;
  });
  const width = droppedItem.maxW
    ? Math.min(selectedSlot.w, droppedItem.maxW)
    : selectedSlot.w;

  return {
    x: Math.min(
      Math.max(anchorColumn - Math.floor(width / 2), selectedSlot.x),
      selectedSlot.x + selectedSlot.w - width,
    ),
    w: width,
  };
}

function pointerColumn(
  event: Event,
  container: HTMLDivElement | null,
  width: number,
  columns: number,
  horizontalGap: number,
) {
  const clientX = "clientX" in event &&
    typeof event.clientX === "number"
    ? event.clientX
    : null;

  if (clientX === null || !container) {
    return null;
  }

  const relativeX = Math.min(
    Math.max(clientX - container.getBoundingClientRect().left, 0),
    Math.max(0, width - 1),
  );
  const columnStep = (width + horizontalGap) / columns;

  return Math.min(
    columns - 1,
    Math.max(0, Math.floor(relativeX / columnStep)),
  );
}

function pointerGridY(
  event: Event,
  container: HTMLDivElement | null,
) {
  const clientY = "clientY" in event &&
    typeof event.clientY === "number"
    ? event.clientY
    : null;

  if (clientY === null || !container) {
    return null;
  }

  return Math.max(
    0,
    Math.round(clientY - container.getBoundingClientRect().top),
  );
}

function pointerIsInsideItem(
  item: PortfolioGridItem,
  pointerY: number,
  anchorColumn: number,
) {
  return anchorColumn >= item.x &&
    anchorColumn < item.x + item.w &&
    pointerY >= item.y &&
    pointerY < item.y + Math.max(1, item.h - gridSectionGap);
}

function findBalancedRowPreview(
  layout: Layout,
  itemId: string,
  pointerY: number,
  anchorColumn: number,
  columns: number,
): DragPreview | null {
  const draggedItem = layout.find((item) => item.i === itemId);
  const rowItems = layout
    .filter(
      (item) =>
        item.i !== itemId &&
        pointerY >= item.y &&
        pointerY < item.y + Math.max(1, item.h - gridSectionGap),
    )
    .sort((first, second) => first.x - second.x);

  if (!draggedItem || rowItems.length === 0) {
    return null;
  }

  const hoveredIndex = rowItems.findIndex(
    (item) =>
      anchorColumn >= item.x && anchorColumn < item.x + item.w,
  );

  if (hoveredIndex === -1) {
    return null;
  }

  const hoveredItem = rowItems[hoveredIndex];
  const insertBefore =
    anchorColumn < hoveredItem.x + hoveredItem.w / 2;
  const orderedItems = [...rowItems];
  orderedItems.splice(
    hoveredIndex + (insertBefore ? 0 : 1),
    0,
    draggedItem,
  );

  const baseWidth = Math.floor(columns / orderedItems.length);
  const remainder = columns % orderedItems.length;
  const widths = orderedItems.map((_, index) =>
    baseWidth + (index < remainder ? 1 : 0)
  );
  const respectsConstraints = orderedItems.every((item, index) => {
    const itemWidth = widths[index];
    return itemWidth >= (item.minW ?? 1) &&
      itemWidth <= (item.maxW ?? columns);
  });

  if (!respectsConstraints) {
    return null;
  }

  const rowY = Math.min(...rowItems.map((item) => item.y));
  let x = 0;
  const placements = orderedItems.map((item, index) => {
    const placement = {
      i: item.i,
      x,
      y: rowY,
      w: widths[index],
    };
    x += widths[index];
    return placement;
  });
  const draggedPlacement = placements.find(
    (placement) => placement.i === itemId,
  );

  if (!draggedPlacement) {
    return null;
  }

  return {
    ...draggedPlacement,
    h: draggedItem.h,
    companions: placements.filter(
      (placement) => placement.i !== itemId,
    ),
  };
}

function distributeRow(
  items: Layout,
  columns: number,
): LayoutPlacement[] | null {
  const orderedItems = [...items].sort((first, second) => first.x - second.x);
  const baseWidth = Math.floor(columns / orderedItems.length);
  const remainder = columns % orderedItems.length;
  const widths = orderedItems.map((_, index) =>
    baseWidth + (index < remainder ? 1 : 0)
  );
  const respectsConstraints = orderedItems.every((item, index) => {
    const itemWidth = widths[index];
    return itemWidth >= (item.minW ?? 1) &&
      itemWidth <= (item.maxW ?? columns);
  });

  if (!respectsConstraints) {
    return null;
  }

  const rowY = Math.min(...orderedItems.map((item) => item.y));
  let x = 0;

  return orderedItems.map((item, index) => {
    const placement = {
      i: item.i,
      x,
      y: rowY,
      w: widths[index],
    };
    x += widths[index];
    return placement;
  });
}

function findSourceVacancyPlacements(
  layout: Layout,
  itemId: string,
  columns: number,
) {
  const draggedItem = layout.find((item) => item.i === itemId);

  if (!draggedItem) {
    return [];
  }

  const sourceNeighbors = layout
    .filter(
      (item) => item.i !== itemId && verticallyOverlaps(draggedItem, item),
    )
    .sort((first, second) => first.y - second.y || first.x - second.x);
  const rowGroups: Layout[] = [];

  for (const item of sourceNeighbors) {
    const rowGroupIndex = rowGroups.findIndex((group) =>
      group.some((groupItem) => verticallyOverlaps(groupItem, item))
    );

    if (rowGroupIndex >= 0) {
      rowGroups[rowGroupIndex] = [...rowGroups[rowGroupIndex], item];
    } else {
      rowGroups.push([item]);
    }
  }

  return rowGroups.flatMap((group) => distributeRow(group, columns) ?? []);
}

function applyPlacements(
  layout: Layout,
  placements: LayoutPlacement[],
) {
  const placementById = new Map(
    placements.map((placement) => [placement.i, placement]),
  );

  return layout.map((item) => {
    const placement = placementById.get(item.i);
    return placement
      ? {
          ...item,
          x: placement.x,
          y: placement.y,
          w: placement.w,
        }
      : { ...item };
  });
}

function mergePlacements(
  ...placementGroups: LayoutPlacement[][]
) {
  const placements = new Map<string, LayoutPlacement>();

  for (const group of placementGroups) {
    for (const placement of group) {
      placements.set(placement.i, placement);
    }
  }

  return [...placements.values()];
}

function findVerticalInsertionPreview(
  layout: Layout,
  itemId: string,
  pointerY: number,
  columns: number,
): DragPreview | null {
  const draggedItem = layout.find((item) => item.i === itemId);
  const otherItems = layout.filter((item) => item.i !== itemId);
  const isInsideRow = otherItems.some(
    (item) =>
      pointerY >= item.y &&
      pointerY < item.y + Math.max(1, item.h - gridSectionGap),
  );

  if (!draggedItem || isInsideRow) {
    return null;
  }

  const nextRowY = otherItems
    .map((item) => item.y)
    .filter((y) => y > pointerY)
    .sort((first, second) => first - second)[0];
  const insertionY = nextRowY ?? otherItems.reduce(
    (bottom, item) => Math.max(bottom, item.y + item.h),
    0,
  );
  const width = Math.min(columns, draggedItem.maxW ?? columns);

  if (width < (draggedItem.minW ?? 1)) {
    return null;
  }

  return {
    i: itemId,
    x: Math.floor((columns - width) / 2),
    y: insertionY,
    w: width,
    h: draggedItem.h,
    companions: otherItems
      .filter((item) => item.y >= insertionY)
      .map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y + draggedItem.h,
        w: item.w,
      })),
  };
}

const freeDragCompactor = {
  ...verticalCompactor,
  allowOverlap: true,
  preventCollision: false,
  compact: (layout: Layout) => layout,
};

function fitAndCompactLayout(
  baseline: Layout,
  preview: DragPreview,
  columns: number,
) {
  const placements = new Map(
    [preview, ...preview.companions].map((placement) => [
      placement.i,
      placement,
    ]),
  );
  const fittedLayout = baseline.map((item) =>
    placements.has(item.i)
      ? {
          ...item,
          x: placements.get(item.i)!.x,
          y: placements.get(item.i)!.y,
          w: placements.get(item.i)!.w,
        }
      : { ...item }
  );

  return verticalCompactor.compact(fittedLayout, columns);
}

function dragPreviewsMatch(
  first: DragPreview | null,
  second: DragPreview,
) {
  return first?.i === second.i &&
    first.x === second.x &&
    first.y === second.y &&
    first.w === second.w &&
    first.h === second.h &&
    JSON.stringify(first.companions) === JSON.stringify(second.companions);
}

function applyLiveCompanionLayout(
  layout: Layout,
  baseline: Layout,
  draggedItemId: string,
  preview: DragPreview | null,
) {
  const baselineItems = new Map(baseline.map((item) => [item.i, item]));
  const livePlacements = new Map(
    (preview ? [preview, ...preview.companions] : []).map((placement) => [
      placement.i,
      placement,
    ]),
  );

  for (const item of layout) {
    if (item.i === draggedItemId && !preview) {
      continue;
    }

    const baselineItem = baselineItems.get(item.i);
    const livePlacement = livePlacements.get(item.i);

    if (!baselineItem) {
      continue;
    }

    item.x = livePlacement?.x ?? baselineItem.x;
    item.y = livePlacement?.y ?? baselineItem.y;
    item.w = livePlacement?.w ?? baselineItem.w;
    item.h = baselineItem.h;
  }
}

function overwriteLayout(layout: Layout, nextLayout: Layout) {
  const nextItems = new Map(nextLayout.map((item) => [item.i, item]));

  for (const item of layout) {
    const nextItem = nextItems.get(item.i);

    if (!nextItem) {
      continue;
    }

    item.x = nextItem.x;
    item.y = nextItem.y;
    item.w = nextItem.w;
    item.h = nextItem.h;
  }
}

function storeAutoHeightMeasurement(
  measurements: AutoHeightMeasurements,
  breakpoint: PortfolioBreakpoint,
  blockId: string,
  measurement: AutoHeightMeasurement,
) {
  const currentMeasurement = measurements[breakpoint]?.[blockId];

  if (
    currentMeasurement?.height === measurement.height &&
    currentMeasurement.rows === measurement.rows
  ) {
    return measurements;
  }

  return {
    ...measurements,
    [breakpoint]: {
      ...measurements[breakpoint],
      [blockId]: measurement,
    },
  };
}

function copyGridItems(layout: Layout): PortfolioGridItem[] {
  return layout.map(({ i, x, y, w, h, minW, minH, maxW, maxH }) => ({
    i,
    x,
    y,
    w,
    h,
    ...(minW === undefined ? {} : { minW }),
    ...(minH === undefined ? {} : { minH }),
    ...(maxW === undefined ? {} : { maxW }),
    ...(maxH === undefined ? {} : { maxH }),
  }));
}

function mergeLayouts(
  layouts: ResponsiveLayouts<PortfolioBreakpoint>,
  fallback: PortfolioLayouts,
): PortfolioLayouts {
  return {
    lg: layouts.lg ? copyGridItems(layouts.lg) : fallback.lg,
    md: layouts.md ? copyGridItems(layouts.md) : fallback.md,
    sm: layouts.sm ? copyGridItems(layouts.sm) : fallback.sm,
  };
}

function documentsMatch(
  first: PortfolioDocument,
  second: PortfolioDocument,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

interface PortfolioGridProps {
  document: PortfolioDocument;
  isEditing: boolean;
  onLayoutsChange: (layouts: PortfolioLayouts) => void;
  onBlockChange: (block: PortfolioBlock) => void;
}

function PortfolioGrid({
  document,
  isEditing,
  onLayoutsChange,
  onBlockChange,
}: PortfolioGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 696,
    measureBeforeMount: true,
  });
  const [breakpoint, setBreakpoint] =
    useState<PortfolioBreakpoint>("lg");
  const [autoHeightMeasurements, setAutoHeightMeasurements] =
    useState<AutoHeightMeasurements>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const dragBaselineRef = useRef<Layout | null>(null);
  const dragPreviewRef = useRef<DragPreview | null>(null);
  const isDraggingRef = useRef(false);
  const pendingAutoHeightMeasurementsRef =
    useRef<AutoHeightMeasurements>({});
  const ignoreNextLayoutChangeRef = useRef(false);

  const visibleBlocks = useMemo(
    () => document.blocks.filter((block) => block.visible),
    [document.blocks],
  );

  const autoHeightBlockIds = useMemo(
    () =>
      new Set(
        document.blocks
          .filter((block) => autoHeightBlockTypes.has(block.type))
          .map((block) => block.id),
      ),
    [document.blocks],
  );

  const renderedLayouts = useMemo<
    ResponsiveLayouts<PortfolioBreakpoint>
  >(() => {
    const applyAutoHeights = (layout: PortfolioGridItem[], currentBreakpoint: PortfolioBreakpoint) =>
      layout.map((item) => {
        if (!autoHeightBlockIds.has(item.i)) {
          return item;
        }

        return {
          ...item,
          h:
            autoHeightMeasurements[currentBreakpoint]?.[item.i]?.rows ??
            item.h,
          minH: 1,
          maxH: undefined,
          isResizable: isEditing && currentBreakpoint !== "sm",
          resizeHandles: horizontalResizeHandles,
        };
      });

    return {
      lg: applyAutoHeights(document.layouts.lg, "lg"),
      md: applyAutoHeights(document.layouts.md, "md"),
      sm: applyAutoHeights(document.layouts.sm, "sm"),
    };
  }, [
    autoHeightBlockIds,
    autoHeightMeasurements,
    document.layouts,
    isEditing,
  ]);

  const handleAutoHeightChange = useCallback(
    (blockId: string, height: number) => {
      const measurement = {
        height: Math.ceil(height),
        rows: rowsForHeight(height),
      };

      if (isDraggingRef.current) {
        pendingAutoHeightMeasurementsRef.current =
          storeAutoHeightMeasurement(
            pendingAutoHeightMeasurementsRef.current,
            breakpoint,
            blockId,
            measurement,
          );
        return;
      }

      setAutoHeightMeasurements((currentMeasurements) =>
        storeAutoHeightMeasurement(
          currentMeasurements,
          breakpoint,
          blockId,
          measurement,
        )
      );
    },
    [breakpoint],
  );

  const handleLayoutChange = useCallback(
    (_layout: Layout, layouts: ResponsiveLayouts<PortfolioBreakpoint>) => {
      if (!isEditing) {
        return;
      }

      if (ignoreNextLayoutChangeRef.current) {
        ignoreNextLayoutChangeRef.current = false;
        return;
      }

      onLayoutsChange(mergeLayouts(layouts, document.layouts));
    },
    [document.layouts, isEditing, onLayoutsChange],
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {mounted && (
        <>
          {dragPreview && (() => {
            const columns = gridColumns[breakpoint];
            const horizontalGap = gridMargins[breakpoint][0];
            const columnWidth =
              (width - horizontalGap * (columns - 1)) / columns;

            return (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-0 rounded-2xl bg-muted ring-4 ring-muted"
                style={{
                  left: dragPreview.x * (columnWidth + horizontalGap),
                  top: dragPreview.y,
                  width:
                    dragPreview.w * columnWidth +
                    (dragPreview.w - 1) * horizontalGap,
                  height: Math.max(1, dragPreview.h - gridSectionGap),
                }}
              />
            );
          })()}

          <Responsive<PortfolioBreakpoint>
          className="portfolio-autofit-grid"
          width={width}
          layouts={renderedLayouts}
          breakpoints={gridBreakpoints}
          cols={gridColumns}
          rowHeight={gridRowHeight}
          margin={gridMargins}
          containerPadding={null}
          compactor={isEditing && isDragging
            ? freeDragCompactor
            : verticalCompactor}
          dragConfig={{
            enabled: isEditing,
            handle: ".portfolio-drag-handle",
          }}
          resizeConfig={{
            enabled: isEditing && breakpoint !== "sm",
            handles: ["se"],
          }}
          onBreakpointChange={setBreakpoint}
          onDragStart={(layout) => {
            dragBaselineRef.current = copyGridItems(layout);
            dragPreviewRef.current = null;
            isDraggingRef.current = true;
            pendingAutoHeightMeasurementsRef.current = {};
            setIsDragging(true);
            setDragPreview(null);
          }}
          onDrag={(layout, _oldItem, newItem, _placeholder, event) => {
            const baseline = dragBaselineRef.current;

            if (!baseline || !newItem) {
              return;
            }

            const columns = gridColumns[breakpoint];
            const anchorColumn = pointerColumn(
              event,
              containerRef.current,
              width,
              columns,
              gridMargins[breakpoint][0],
            ) ?? Math.min(
              columns - 1,
              newItem.x + Math.floor(newItem.w / 2),
            );
            const pointerY = pointerGridY(
              event,
              containerRef.current,
            );
            const draggedBaselineItem = baseline.find(
              (item) => item.i === newItem.i,
            );

            if (
              pointerY !== null &&
              draggedBaselineItem &&
              pointerIsInsideItem(
                draggedBaselineItem,
                pointerY,
                anchorColumn,
              )
            ) {
              applyLiveCompanionLayout(
                layout,
                baseline,
                newItem.i,
                null,
              );
              dragPreviewRef.current = null;
              setDragPreview(null);
              return;
            }

            const sourcePlacements = findSourceVacancyPlacements(
              baseline,
              newItem.i,
              columns,
            );
            const placementBaseline = applyPlacements(
              baseline,
              sourcePlacements,
            );
            const balancedPreview = pointerY === null
              ? null
              : findBalancedRowPreview(
                  placementBaseline,
                  newItem.i,
                  pointerY,
                  anchorColumn,
                  columns,
                );
            const insertionPreview =
              pointerY === null || balancedPreview
                ? null
                : findVerticalInsertionPreview(
                    placementBaseline,
                    newItem.i,
                    pointerY,
                    columns,
                  );
            const slot = balancedPreview || insertionPreview
              ? null
              : findHorizontalSlot(
                  placementBaseline,
                  newItem.i,
                  newItem.y,
                  newItem.h,
                  anchorColumn,
                  columns,
                );

            if (!balancedPreview && !insertionPreview && !slot) {
              applyLiveCompanionLayout(
                layout,
                baseline,
                newItem.i,
                null,
              );
              dragPreviewRef.current = null;
              setDragPreview(null);
              return;
            }

            const targetPreview: DragPreview =
              balancedPreview ?? insertionPreview ?? {
              i: newItem.i,
              x: slot!.x,
              y: newItem.y,
              w: slot!.w,
              h: newItem.h,
              companions: [],
            };
            const initialPreview = {
              ...targetPreview,
              companions: mergePlacements(
                sourcePlacements,
                targetPreview.companions,
              ).filter((placement) => placement.i !== newItem.i),
            };
            const compactedItem = fitAndCompactLayout(
              baseline,
              initialPreview,
              columns,
            ).find((item) => item.i === newItem.i);
            const preview = compactedItem
              ? { ...initialPreview, y: compactedItem.y }
              : initialPreview;

            applyLiveCompanionLayout(
              layout,
              baseline,
              newItem.i,
              preview,
            );
            dragPreviewRef.current = preview;
            setDragPreview((currentPreview) =>
              dragPreviewsMatch(currentPreview, preview)
                ? currentPreview
                : preview
            );
          }}
          onDragStop={(layout) => {
            const baseline = dragBaselineRef.current;
            const preview = dragPreviewRef.current;

            if (baseline) {
              const finalLayout = preview
                ? fitAndCompactLayout(
                    baseline,
                    preview,
                    gridColumns[breakpoint],
                  )
                : baseline;

              overwriteLayout(layout, finalLayout);
            }

            if (baseline && preview) {
              const compactedLayout = copyGridItems(
                fitAndCompactLayout(
                  baseline,
                  preview,
                  gridColumns[breakpoint],
                ),
              );

              ignoreNextLayoutChangeRef.current = true;
              onLayoutsChange({
                ...document.layouts,
                [breakpoint]: compactedLayout,
              });
              queueMicrotask(() => {
                ignoreNextLayoutChangeRef.current = false;
              });
            }

            dragBaselineRef.current = null;
            dragPreviewRef.current = null;
            isDraggingRef.current = false;
            setIsDragging(false);
            setDragPreview(null);

            const pendingMeasurements =
              pendingAutoHeightMeasurementsRef.current;
            pendingAutoHeightMeasurementsRef.current = {};
            setAutoHeightMeasurements((currentMeasurements) => {
              let nextMeasurements = currentMeasurements;

              for (const [pendingBreakpoint, measurements] of
                Object.entries(pendingMeasurements)) {
                for (const [blockId, measurement] of
                  Object.entries(measurements ?? {})) {
                  nextMeasurements = storeAutoHeightMeasurement(
                    nextMeasurements,
                    pendingBreakpoint as PortfolioBreakpoint,
                    blockId,
                    measurement,
                  );
                }
              }

              return nextMeasurements;
            });
          }}
          onLayoutChange={handleLayoutChange}
        >
          {visibleBlocks.map((block) => {
            const blockContent = renderPortfolioBlock(block, {
              isEditing,
              onBlockChange,
            });
            const hasAutoHeight = autoHeightBlockIds.has(block.id);
            const measuredHeight =
              autoHeightMeasurements[breakpoint]?.[block.id]?.height;
            const layoutItem = renderedLayouts[breakpoint]?.find(
              (item) => item.i === block.id,
            );
            const visibleHeight = measuredHeight ??
              (layoutItem
                ? Math.max(1, layoutItem.h - gridSectionGap)
                : undefined);
            const isLiveDraggedBlock = dragPreview?.i === block.id;
            const sectionStyle: PortfolioSectionStyle = {};

            if (visibleHeight) {
              sectionStyle["--portfolio-section-height"] = `${visibleHeight}px`;
            }

            if (isLiveDraggedBlock && dragPreview) {
              const columns = gridColumns[breakpoint];
              const horizontalGap = gridMargins[breakpoint][0];
              const columnWidth =
                (width - horizontalGap * (columns - 1)) / columns;

              sectionStyle["--portfolio-live-x"] =
                `${dragPreview.x * (columnWidth + horizontalGap)}px`;
              sectionStyle["--portfolio-live-y"] =
                `${dragPreview.y}px`;
              sectionStyle["--portfolio-live-width"] =
                `${
                  dragPreview.w * columnWidth +
                  (dragPreview.w - 1) * horizontalGap
                }px`;
              sectionStyle["--portfolio-live-offset-x"] =
                dragPreview.w === columns
                  ? "0px"
                  : dragPreview.x + dragPreview.w / 2 >= columns / 2
                    ? "-8px"
                    : "8px";
              sectionStyle["--portfolio-live-offset-y"] = "8px";
            }

            return (
              <div
                className={`${
                  hasAutoHeight
                    ? isEditing
                      ? "portfolio-auto-height portfolio-auto-height-editing group/block @container/block rounded-2xl p-2.5 outline outline-1 outline-border"
                      : "portfolio-auto-height"
                    : isEditing
                      ? block.type === "banner"
                        ? "portfolio-manual-height group/block overflow-hidden rounded-2xl outline outline-1 outline-border"
                        : "group/block rounded-2xl p-2.5 outline outline-1 outline-border"
                      : "portfolio-manual-height"
                }${isLiveDraggedBlock ? " portfolio-live-drag" : ""}`}
                key={block.id}
                style={sectionStyle}
              >
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="portfolio-drag-handle absolute top-2 right-2 z-20 cursor-grab capitalize shadow-sm backdrop-blur active:cursor-grabbing"
                    aria-label={`Move ${block.type} section`}
                  >
                    <HugeiconsIcon
                      icon={DragDropIcon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    {block.type}
                  </Button>
                )}

                {hasAutoHeight ? (
                  <AutoHeightContent
                    blockId={block.id}
                    editingInset={isEditing ? 20 : 0}
                    onHeightChange={handleAutoHeightChange}
                  >
                    {blockContent}
                  </AutoHeightContent>
                ) : (
                  <div
                    className={
                      isEditing
                        ? "size-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        : "size-full overflow-visible"
                    }
                  >
                    {blockContent}
                  </div>
                )}
              </div>
            );
          })}
          </Responsive>
        </>
      )}
    </div>
  );
}

export function PortfolioDocumentRenderer() {
  const [publishedRecord, setPublishedRecord] =
    useState<PortfolioDocumentRecord | null>(null);
  const [draftRecord, setDraftRecord] =
    useState<PortfolioDocumentRecord | null>(null);
  const [workingDocument, setWorkingDocument] = useState<PortfolioDocument>(
    defaultPortfolioDocument,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { isAdmin } = useAdminSession();

  useEffect(() => {
    let isActive = true;

    const request = isAdmin
      ? Promise.all([
          getPortfolioDocument("published"),
          getPortfolioDocument("draft"),
        ])
      : getPortfolioDocument("published").then((published) => [
          published,
          null,
        ] as const);

    void request
      .then(([published, draft]) => {
        if (isActive) {
          setPublishedRecord(published);
          setDraftRecord(draft);
          setWorkingDocument(draft?.document ?? published.document);
          setIsEditing(false);
          setSaveError("");
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Could not load the portfolio document.",
          error,
        );
      });

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  const publishedDocument =
    publishedRecord?.document ?? defaultPortfolioDocument;
  const displayedDocument = isEditing
    ? workingDocument
    : publishedDocument;
  const hasChanges = !documentsMatch(
    workingDocument,
    publishedDocument,
  );

  const handleLayoutsChange = useCallback((layouts: PortfolioLayouts) => {
    setWorkingDocument((currentDocument) => {
      const nextDocument = { ...currentDocument, layouts };
      return documentsMatch(nextDocument, currentDocument)
        ? currentDocument
        : nextDocument;
    });
  }, []);

  const handleBlockChange = useCallback((nextBlock: PortfolioBlock) => {
    setWorkingDocument((currentDocument) => ({
      ...currentDocument,
      blocks: currentDocument.blocks.map((block) =>
        block.id === nextBlock.id ? nextBlock : block
      ),
    }));
  }, []);

  const handleResetLayout = useCallback(() => {
    setWorkingDocument((currentDocument) => ({
      ...currentDocument,
      layouts: {
        lg: copyGridItems(defaultPortfolioDocument.layouts.lg),
        md: copyGridItems(defaultPortfolioDocument.layouts.md),
        sm: copyGridItems(defaultPortfolioDocument.layouts.sm),
      },
    }));
  }, []);

  async function handleDiscardChanges() {
    if (!draftRecord || !publishedRecord) {
      return;
    }

    const previousDocument = workingDocument;
    setWorkingDocument(publishedRecord.document);
    setIsPublishing(true);
    setSaveError("");

    try {
      const savedDraft = await updatePortfolioDocument(
        draftRecord,
        publishedRecord.document,
      );
      setDraftRecord(savedDraft);
    } catch (error) {
      setWorkingDocument(previousDocument);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not discard the draft changes.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function handlePublish() {
    if (!draftRecord || !publishedRecord || !hasChanges) {
      return;
    }

    setIsPublishing(true);
    setSaveError("");

    try {
      const savedDraft = await updatePortfolioDocument(
        draftRecord,
        workingDocument,
      );
      setDraftRecord(savedDraft);

      const savedPublished = await updatePortfolioDocument(
        publishedRecord,
        workingDocument,
      );
      setPublishedRecord(savedPublished);
      setWorkingDocument(savedPublished.document);
      setIsEditing(false);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not publish the portfolio.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <PortfolioGrid
        document={displayedDocument}
        isEditing={isEditing}
        onLayoutsChange={handleLayoutsChange}
        onBlockChange={handleBlockChange}
      />

      {isAdmin && (
        <>
          <EditorToolbar
            isEditing={isEditing}
            hasChanges={hasChanges}
            isPublishing={isPublishing}
            onToggleEditing={() => {
              setIsEditing((current) => !current);
              setSaveError("");
            }}
            onDiscardChanges={() => {
              void handleDiscardChanges();
            }}
            onResetLayout={handleResetLayout}
            onPublish={() => {
              void handlePublish();
            }}
            sections={workingDocument.blocks}
            onSectionVisibilityChange={(sectionId, visible) => {
              setWorkingDocument((currentDocument) => ({
                ...currentDocument,
                blocks: currentDocument.blocks.map((block) =>
                  block.id === sectionId ? { ...block, visible } : block
                ),
              }));
            }}
          />

          {saveError && (
            <p
              className="fixed right-4 bottom-20 z-40 max-w-sm text-sm text-destructive sm:bottom-4"
              role="alert"
            >
              {saveError}
            </p>
          )}
        </>
      )}
    </>
  );
}
