import type {
  PortfolioBlock,
  PortfolioDocument,
  PortfolioGridItem,
  RichTextDocument,
} from "../types/portfolio";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(
    (item) => typeof item === "string",
  );
}

function isRichTextDocument(value: unknown): value is RichTextDocument {
  return isRecord(value) && value.type === "doc" &&
    Array.isArray(value.content);
}

function isPortfolioBlock(value: unknown): value is PortfolioBlock {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.visible !== "boolean" ||
    !isRecord(value.content)
  ) {
    return false;
  }

  switch (value.type) {
    case "about":
      return typeof value.content.introduction === "string" &&
        isStringArray(value.content.roles) &&
        isRichTextDocument(value.content.biography);
    case "banner":
      return typeof value.content.label === "string";
    case "projects":
      return typeof value.content.heading === "string" &&
        typeof value.content.emptyMessage === "string";
    default:
      return false;
  }
}

function isGridItem(value: unknown): value is PortfolioGridItem {
  return isRecord(value) &&
    typeof value.i === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.w === "number" &&
    typeof value.h === "number";
}

function hasPortfolioDocumentStructure(value: unknown) {
  if (
    !isRecord(value) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2) ||
    !Array.isArray(value.blocks) ||
    !value.blocks.every(isPortfolioBlock) ||
    !isRecord(value.layouts)
  ) {
    return false;
  }

  const layouts = value.layouts;

  return ["lg", "md", "sm"].every((breakpoint) => {
    const layout = layouts[breakpoint];
    return Array.isArray(layout) && layout.every(isGridItem);
  });
}

function migrateLegacyGridItem(item: PortfolioGridItem): PortfolioGridItem {
  const legacyPixelStep = 60;

  return {
    ...item,
    y: item.y * legacyPixelStep,
    h: item.h * legacyPixelStep,
    ...(item.minH === undefined
      ? {}
      : { minH: item.minH * legacyPixelStep }),
    ...(item.maxH === undefined
      ? {}
      : { maxH: item.maxH * legacyPixelStep }),
  };
}

export function parsePortfolioDocument(
  value: unknown,
): PortfolioDocument | null {
  if (!hasPortfolioDocumentStructure(value)) {
    return null;
  }

  const validatedDocument = value as Omit<
    PortfolioDocument,
    "schemaVersion"
  > & { schemaVersion: 1 | 2 };

  if (validatedDocument.schemaVersion === 2) {
    return validatedDocument as PortfolioDocument;
  }

  const legacyDocument = validatedDocument as Omit<
    PortfolioDocument,
    "schemaVersion"
  > & { schemaVersion: 1 };

  return {
    ...legacyDocument,
    schemaVersion: 2,
    layouts: {
      lg: legacyDocument.layouts.lg.map(migrateLegacyGridItem),
      md: legacyDocument.layouts.md.map(migrateLegacyGridItem),
      sm: legacyDocument.layouts.sm.map(migrateLegacyGridItem),
    },
  };
}
