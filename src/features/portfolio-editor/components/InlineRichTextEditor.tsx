import { Button } from "@/components/ui/button";
import {
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import type { RichTextDocument } from "../types/portfolio";

interface InlineRichTextEditorProps {
  content: RichTextDocument;
  label: string;
  onChange: (content: RichTextDocument) => void;
}

export function InlineRichTextEditor({
  content,
  label,
  onChange,
}: InlineRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        orderedList: false,
        strike: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        "aria-label": label,
        class:
          "min-h-16 rounded-md px-2 py-1 -mx-2 -my-1 leading-relaxed text-muted-foreground outline-none ring-ring/30 transition-shadow [&_p]:m-0 [&_p+_p]:mt-2 focus-visible:ring-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as RichTextDocument);
    },
  });
  const textStyles = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor?.isActive("bold") ?? false,
      isItalic: currentEditor?.isActive("italic") ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const editorContent = editor.getJSON();

    if (JSON.stringify(editorContent) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: currentEditor }) =>
          !currentEditor.state.selection.empty
        }
      >
        <div className="flex items-center gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
          <Button
            type="button"
            size="icon-sm"
            variant={textStyles.isBold ? "secondary" : "ghost"}
            aria-label="Bold"
            aria-pressed={textStyles.isBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <HugeiconsIcon
              icon={TextBoldIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant={textStyles.isItalic ? "secondary" : "ghost"}
            aria-label="Italic"
            aria-pressed={textStyles.isItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <HugeiconsIcon
              icon={TextItalicIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
}
