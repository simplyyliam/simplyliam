export const portfolioBreakpoints = ["lg", "md", "sm"] as const;

export type PortfolioBreakpoint =
  (typeof portfolioBreakpoints)[number];
export type PortfolioBlockType = "about" | "banner" | "projects";
export type PortfolioDocumentStatus = "draft" | "published";

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
  content?: RichTextNode[];
}

export interface RichTextDocument extends RichTextNode {
  type: "doc";
  content: RichTextNode[];
}

export interface AboutBlockContent {
  introduction: string;
  roles: string[];
  biography: RichTextDocument;
}

export interface BannerBlockContent {
  label: string;
}

export interface ProjectsBlockContent {
  heading: string;
  emptyMessage: string;
}

export interface PortfolioBlockContentMap {
  about: AboutBlockContent;
  banner: BannerBlockContent;
  projects: ProjectsBlockContent;
}

export type PortfolioBlock = {
  [Type in PortfolioBlockType]: {
    id: string;
    type: Type;
    visible: boolean;
    content: PortfolioBlockContentMap[Type];
  };
}[PortfolioBlockType];

export interface PortfolioGridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type PortfolioLayouts = Record<
  PortfolioBreakpoint,
  PortfolioGridItem[]
>;

export interface PortfolioDocument {
  schemaVersion: 1;
  blocks: PortfolioBlock[];
  layouts: PortfolioLayouts;
}

export interface PortfolioDocumentRecord {
  id: string;
  pageId: string;
  status: PortfolioDocumentStatus;
  document: PortfolioDocument;
  revision: number;
  updatedAt: string;
}
