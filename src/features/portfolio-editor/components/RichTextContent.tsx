import { Fragment, type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import type {
  RichTextDocument,
  RichTextNode,
} from "../types/portfolio";

const allowedTextColors = new Set([
  "#525252",
  "#92400e",
  "#c2410c",
  "#a16207",
  "#15803d",
  "#1d4ed8",
  "#7e22ce",
  "#be185d",
  "#b91c1c",
]);

function getSafeHref(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return /^(https?:\/\/|mailto:|\/|#)/i.test(value)
    ? value
    : undefined;
}

function renderChildren(node: RichTextNode, keyPrefix: string) {
  return node.content?.map((child, index) =>
    renderNode(child, `${keyPrefix}-${index}`)
  );
}

function renderText(node: RichTextNode, key: string) {
  let content: ReactNode = node.text ?? "";

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        content = <strong>{content}</strong>;
        break;
      case "italic":
        content = <em>{content}</em>;
        break;
      case "underline":
        content = (
          <span className="underline decoration-from-font underline-offset-2">
            {content}
          </span>
        );
        break;
      case "link": {
        const href = getSafeHref(mark.attrs?.href);
        content = href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-from-font underline-offset-2"
          >
            {content}
          </a>
        ) : content;
        break;
      }
      case "textStyle": {
        const color = mark.attrs?.color;
        content = typeof color === "string" && allowedTextColors.has(color)
          ? <span style={{ color }}>{content}</span>
          : content;
        break;
      }
      case "strike":
        content = <s>{content}</s>;
        break;
      case "code":
        content = <code>{content}</code>;
        break;
    }
  }

  return <Fragment key={key}>{content}</Fragment>;
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  const children = renderChildren(node, key);

  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);

      if (level === 1) return <h1 key={key}>{children}</h1>;
      if (level === 2) return <h2 key={key}>{children}</h2>;
      return <h3 key={key}>{children}</h3>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return <pre key={key}><code>{children}</code></pre>;
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <Separator key={key} />;
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

interface RichTextContentProps {
  document: RichTextDocument;
}

export function RichTextContent({ document }: RichTextContentProps) {
  return (
    <div className="max-w-3xl text-pretty leading-relaxed text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_p+_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
      {renderChildren(document, "rich-text")}
    </div>
  );
}
