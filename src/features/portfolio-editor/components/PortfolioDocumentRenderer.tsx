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

interface DragPreview extends HorizontalSlot {
  i: string;
  y: number;
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

function restoreDragLayout(
  layout: Layout,
  baseline: Layout,
  preview: DragPreview,
) {
  const baselineItems = new Map(baseline.map((item) => [item.i, item]));

  for (const item of layout) {
    const baselineItem = baselineItems.get(item.i);

    if (item.i === preview.i) {
      item.x = preview.x;
      item.y = preview.y;
      item.w = preview.w;
    } else if (baselineItem) {
      item.x = baselineItem.x;
      item.y = baselineItem.y;
      item.w = baselineItem.w;
      item.h = baselineItem.h;
    }
  }
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
  const dragBaselineRef = useRef<Layout | null>(null);
  const dragPreviewRef = useRef<DragPreview | null>(null);

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
          isResizable: true,
          resizeHandles: horizontalResizeHandles,
        };
      });

    return {
      lg: applyAutoHeights(document.layouts.lg, "lg"),
      md: applyAutoHeights(document.layouts.md, "md"),
      sm: applyAutoHeights(document.layouts.sm, "sm"),
    };
  }, [autoHeightBlockIds, autoHeightMeasurements, document.layouts]);

  const handleAutoHeightChange = useCallback(
    (blockId: string, height: number) => {
      const rows = rowsForHeight(height);

      const measuredHeight = Math.ceil(height);

      setAutoHeightMeasurements((currentMeasurements) => {
        const currentMeasurement =
          currentMeasurements[breakpoint]?.[blockId];

        if (
          currentMeasurement?.height === measuredHeight &&
          currentMeasurement.rows === rows
        ) {
          return currentMeasurements;
        }

        return {
          ...currentMeasurements,
          [breakpoint]: {
            ...currentMeasurements[breakpoint],
            [blockId]: { height: measuredHeight, rows },
          },
        };
      });
    },
    [breakpoint],
  );

  const handleLayoutChange = useCallback(
    (_layout: Layout, layouts: ResponsiveLayouts<PortfolioBreakpoint>) => {
      if (isEditing) {
        onLayoutsChange(mergeLayouts(layouts, document.layouts));
      }
    },
    [document.layouts, isEditing, onLayoutsChange],
  );

  return (
    <div className="w-full" ref={containerRef}>
      {mounted && (
        <Responsive<PortfolioBreakpoint>
          width={width}
          layouts={renderedLayouts}
          breakpoints={gridBreakpoints}
          cols={gridColumns}
          rowHeight={gridRowHeight}
          margin={gridMargins}
          containerPadding={null}
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
          }}
          onDrag={(layout, _oldItem, newItem, placeholder, event) => {
            const baseline = dragBaselineRef.current;

            if (!baseline || !newItem || !placeholder) {
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
            const slot = findHorizontalSlot(
              baseline,
              newItem.i,
              newItem.y,
              newItem.h,
              anchorColumn,
              columns,
            );

            if (!slot) {
              return;
            }

            const preview = {
              i: newItem.i,
              x: slot.x,
              y: newItem.y,
              w: slot.w,
            };

            dragPreviewRef.current = preview;
            restoreDragLayout(layout, baseline, preview);
            placeholder.x = preview.x;
            placeholder.y = preview.y;
            placeholder.w = preview.w;
          }}
          onDragStop={(layout) => {
            const baseline = dragBaselineRef.current;
            const preview = dragPreviewRef.current;

            if (baseline && preview) {
              restoreDragLayout(layout, baseline, preview);
              const compactedItems = new Map(
                verticalCompactor
                  .compact(layout, gridColumns[breakpoint])
                  .map((item) => [item.i, item]),
              );

              for (const item of layout) {
                const compactedItem = compactedItems.get(item.i);

                if (compactedItem) {
                  item.x = compactedItem.x;
                  item.y = compactedItem.y;
                  item.w = compactedItem.w;
                  item.h = compactedItem.h;
                }
              }
            }

            dragBaselineRef.current = null;
            dragPreviewRef.current = null;
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

            return (
              <div
                className={
                  hasAutoHeight
                    ? isEditing
                      ? "portfolio-auto-height group/block @container/block rounded-2xl p-2.5 outline outline-1 outline-border"
                      : "portfolio-auto-height"
                    : isEditing
                      ? block.type === "banner"
                        ? "portfolio-manual-height group/block overflow-hidden rounded-2xl outline outline-1 outline-border"
                        : "group/block rounded-2xl p-2.5 outline outline-1 outline-border"
                      : "portfolio-manual-height"
                }
                key={block.id}
                style={
                  visibleHeight
                    ? ({
                        "--portfolio-section-height": `${visibleHeight}px`,
                      } as CSSProperties)
                    : undefined
                }
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
