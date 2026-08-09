import {
  About,
  ProjectsSection,
} from "@/features/main/components";
import { Banner } from "@/widgets/banner";
import { Suspense, type ReactNode } from "react";
import type {
  PortfolioBlock,
  PortfolioBlockType,
} from "../types/portfolio";
import { richTextToPlainText } from "../utils/richText";
import { InlineTextEditor } from "../components/InlineTextEditor";
import { LazyInlineRichTextEditor } from "../components/LazyInlineRichTextEditor";
import { RichTextContent } from "../components/RichTextContent";

type BlockOfType<Type extends PortfolioBlockType> = Extract<
  PortfolioBlock,
  { type: Type }
>;

type PortfolioBlockRegistry = {
  [Type in PortfolioBlockType]: (
    block: BlockOfType<Type>,
    options?: RenderPortfolioBlockOptions,
  ) => ReactNode;
};

interface RenderPortfolioBlockOptions {
  isEditing?: boolean;
  onBlockChange?: (block: PortfolioBlock) => void;
}

export const portfolioBlockRegistry: PortfolioBlockRegistry = {
  about: (block, options) => (
    <About
      introduction={block.content.introduction}
      roles={block.content.roles}
      biography={richTextToPlainText(block.content.biography)}
      biographyContent={
        <RichTextContent document={block.content.biography} />
      }
      introductionEditor={options?.isEditing ? (
        <InlineTextEditor
          value={block.content.introduction}
          label="Introduction"
          onChange={(introduction) => {
            options.onBlockChange?.({
              ...block,
              content: { ...block.content, introduction },
            });
          }}
        />
      ) : undefined}
      rolesEditor={options?.isEditing ? (
        <InlineTextEditor
          value={block.content.roles.join(", ")}
          label="Rotating roles, separated by commas"
          onChange={(value) => {
            const roles = value
              .split(",")
              .map((role) => role.trim())
              .filter(Boolean);

            options.onBlockChange?.({
              ...block,
              content: { ...block.content, roles },
            });
          }}
        />
      ) : undefined}
      biographyEditor={options?.isEditing ? (
        <Suspense
          fallback={
            <p className="leading-relaxed text-muted-foreground">
              {richTextToPlainText(block.content.biography)}
            </p>
          }
        >
          <LazyInlineRichTextEditor
            content={block.content.biography}
            label="Biography"
            onChange={(biography) => {
              options.onBlockChange?.({
                ...block,
                content: { ...block.content, biography },
              });
            }}
          />
        </Suspense>
      ) : undefined}
    />
  ),
  banner: (block, options) => (
    <Banner
      fallbackLabel={block.content.label}
      fallbackEditor={options?.isEditing ? (
        <InlineTextEditor
          value={block.content.label}
          label="Banner fallback label"
          onChange={(label) => {
            options.onBlockChange?.({
              ...block,
              content: { ...block.content, label },
            });
          }}
        />
      ) : undefined}
    />
  ),
  projects: (block, options) => (
    <ProjectsSection
      heading={block.content.heading}
      emptyMessage={block.content.emptyMessage}
      headingEditor={options?.isEditing ? (
        <InlineTextEditor
          value={block.content.heading}
          label="Projects heading"
          onChange={(heading) => {
            options.onBlockChange?.({
              ...block,
              content: { ...block.content, heading },
            });
          }}
        />
      ) : undefined}
      emptyMessageEditor={options?.isEditing ? (
        <InlineTextEditor
          value={block.content.emptyMessage}
          label="Empty projects message"
          onChange={(emptyMessage) => {
            options.onBlockChange?.({
              ...block,
              content: { ...block.content, emptyMessage },
            });
          }}
        />
      ) : undefined}
    />
  ),
};

export function renderPortfolioBlock(
  block: PortfolioBlock,
  options?: RenderPortfolioBlockOptions,
) {
  switch (block.type) {
    case "about":
      return portfolioBlockRegistry.about(block, options);
    case "banner":
      return portfolioBlockRegistry.banner(block, options);
    case "projects":
      return portfolioBlockRegistry.projects(block, options);
  }
}
