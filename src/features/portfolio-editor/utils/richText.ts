import type {
  RichTextDocument,
  RichTextNode,
} from "../types/portfolio";

function getNodeText(node: RichTextNode): string {
  if (typeof node.text === "string") {
    return node.text;
  }

  return node.content?.map(getNodeText).join("") ?? "";
}

export function richTextToPlainText(
  document: RichTextDocument,
): string {
  return document.content.map(getNodeText).join("\n");
}
