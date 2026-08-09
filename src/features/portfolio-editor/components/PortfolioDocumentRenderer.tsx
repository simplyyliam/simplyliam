import { useEffect, useState } from "react";
import { defaultPortfolioDocument } from "../data/defaultPortfolio";
import { getPortfolioDocument } from "../data/portfolio";
import { renderPortfolioBlock } from "../registry/blocks";
import type { PortfolioDocument } from "../types/portfolio";

export function PortfolioDocumentRenderer() {
  const [document, setDocument] = useState<PortfolioDocument>(
    defaultPortfolioDocument,
  );

  useEffect(() => {
    let isActive = true;

    void getPortfolioDocument("published")
      .then((record) => {
        if (isActive) {
          setDocument(record.document);
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Could not load the published portfolio document.",
          error,
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  return document.blocks
    .filter((block) => block.visible)
    .map((block) => (
      <div className="contents" key={block.id}>
        {renderPortfolioBlock(block)}
      </div>
    ));
}
