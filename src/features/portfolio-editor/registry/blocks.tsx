import {
  About,
  ProjectsSection,
} from "@/features/main/components";
import { Banner } from "@/widgets/banner";
import type { ReactNode } from "react";
import type {
  PortfolioBlock,
  PortfolioBlockType,
} from "../types/portfolio";
import { richTextToPlainText } from "../utils/richText";

type BlockOfType<Type extends PortfolioBlockType> = Extract<
  PortfolioBlock,
  { type: Type }
>;

type PortfolioBlockRegistry = {
  [Type in PortfolioBlockType]: (
    block: BlockOfType<Type>,
  ) => ReactNode;
};

export const portfolioBlockRegistry: PortfolioBlockRegistry = {
  about: (block) => (
    <About
      introduction={block.content.introduction}
      roles={block.content.roles}
      biography={richTextToPlainText(block.content.biography)}
    />
  ),
  banner: (block) => (
    <Banner fallbackLabel={block.content.label} />
  ),
  projects: (block) => (
    <ProjectsSection
      heading={block.content.heading}
      emptyMessage={block.content.emptyMessage}
    />
  ),
};

export function renderPortfolioBlock(block: PortfolioBlock) {
  switch (block.type) {
    case "about":
      return portfolioBlockRegistry.about(block);
    case "banner":
      return portfolioBlockRegistry.banner(block);
    case "projects":
      return portfolioBlockRegistry.projects(block);
  }
}
