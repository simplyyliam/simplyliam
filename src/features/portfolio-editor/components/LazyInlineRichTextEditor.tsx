import { lazy } from "react";

export const LazyInlineRichTextEditor = lazy(() =>
  import("./InlineRichTextEditor").then((module) => ({
    default: module.InlineRichTextEditor,
  }))
);
