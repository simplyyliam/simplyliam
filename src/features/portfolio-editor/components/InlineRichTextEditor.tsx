import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowDown01Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Color, TextStyle } from "@tiptap/extension-text-style";
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

const textColors = [
  { label: "Default", value: null, swatch: "#a3a3a3" },
  { label: "Gray", value: "#525252", swatch: "#737373" },
  { label: "Brown", value: "#92400e", swatch: "#92400e" },
  { label: "Orange", value: "#c2410c", swatch: "#c2410c" },
  { label: "Yellow", value: "#a16207", swatch: "#ca8a04" },
  { label: "Green", value: "#15803d", swatch: "#16a34a" },
  { label: "Blue", value: "#1d4ed8", swatch: "#2563eb" },
  { label: "Purple", value: "#7e22ce", swatch: "#9333ea" },
  { label: "Pink", value: "#be185d", swatch: "#db2777" },
  { label: "Red", value: "#b91c1c", swatch: "#dc2626" },
] as const;

const toolbarButtonClass =
  "rounded-lg text-background transition-[background-color,color,scale] duration-150 ease-out hover:bg-background/15 hover:text-background active:scale-[0.96]";

export function InlineRichTextEditor({
  content,
  label,
  onChange,
}: InlineRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
        link: {
          defaultProtocol: "https",
          openOnClick: false,
        },
        strike: false,
      }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        "aria-label": label,
        class:
          "min-h-16 max-w-3xl rounded-lg px-1 py-1 -mx-1 leading-relaxed text-muted-foreground caret-foreground outline-none ring-ring/30 selection:bg-neutral-400/50 selection:text-foreground transition-[box-shadow] duration-150 [&_a]:underline [&_a]:underline-offset-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:inline [&_p]:box-decoration-clone [&_p]:rounded-sm [&_p]:bg-muted/80 [&_p]:px-1 [&_p]:py-0.5 [&_p]:after:whitespace-pre [&_p]:after:content-['\\A'] [&_ul]:list-disc [&_ul]:pl-5 focus-visible:ring-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as RichTextDocument);
    },
  });
  const textStyles = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const headingLevel = currentEditor?.isActive("heading", { level: 1 })
        ? 1
        : currentEditor?.isActive("heading", { level: 2 })
          ? 2
          : currentEditor?.isActive("heading", { level: 3 })
            ? 3
            : null;

      return {
        color: currentEditor?.getAttributes("textStyle").color as
          | string
          | undefined,
        headingLevel,
        isBold: currentEditor?.isActive("bold") ?? false,
        isBulletList: currentEditor?.isActive("bulletList") ?? false,
        isItalic: currentEditor?.isActive("italic") ?? false,
        isLink: currentEditor?.isActive("link") ?? false,
        isOrderedList: currentEditor?.isActive("orderedList") ?? false,
        isUnderline: currentEditor?.isActive("underline") ?? false,
      };
    },
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

  const blockLabel = textStyles.headingLevel
    ? `Heading ${textStyles.headingLevel}`
    : "Paragraph";
  const activeColor = textColors.find(
    (color) => color.value === (textStyles.color ?? null),
  ) ?? textColors[0];

  function editLink() {
    const currentUrl = editor.getAttributes("link").href as
      | string
      | undefined;
    const nextUrl = window.prompt(
      "Enter a link URL. Leave it empty to remove the link.",
      currentUrl ?? "https://",
    );

    if (nextUrl === null) {
      return;
    }

    if (nextUrl.trim().length === 0) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: nextUrl.trim() })
      .run();
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="z-40"
        appendTo={() => document.body}
        updateDelay={80}
        options={{
          strategy: "fixed",
          placement: "top",
          offset: 8,
          flip: true,
          shift: { padding: 8 },
        }}
        shouldShow={({ editor: currentEditor }) =>
          !currentEditor.state.selection.empty
        }
      >
        <div className="flex max-w-[calc(100vw-1rem)] items-center gap-0.5 overflow-x-auto rounded-xl bg-foreground p-1 text-background shadow-xl">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="default"
                  variant="ghost"
                  className={toolbarButtonClass}
                />
              }
            >
              {blockLabel}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Turn into</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().setParagraph().run()}
                >
                  Paragraph
                </DropdownMenuItem>
                {[1, 2, 3].map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: level as 1 | 2 | 3 })
                        .run()
                    }
                  >
                    Heading {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="default"
                  variant="ghost"
                  className={toolbarButtonClass}
                />
              }
            >
              <span
                className="size-3 rounded-full shadow-[0_0_0_1px_oklch(1_0_0/0.3)]"
                style={{ backgroundColor: activeColor.swatch }}
              />
              Color
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Text color</DropdownMenuLabel>
                {textColors.map((color) => (
                  <DropdownMenuItem
                    key={color.label}
                    onClick={() => {
                      if (color.value) {
                        editor.chain().focus().setColor(color.value).run();
                      } else {
                        editor.chain().focus().unsetColor().run();
                      }
                    }}
                  >
                    <span
                      className="size-3 rounded-full shadow-[0_0_0_1px_oklch(0_0_0/0.12)]"
                      style={{ backgroundColor: color.swatch }}
                    />
                    {color.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator
            orientation="vertical"
            className="mx-0.5 h-5 bg-background/20"
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isBold && "bg-background/20",
            )}
            aria-label="Bold"
            aria-pressed={textStyles.isBold}
            title="Bold"
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
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isItalic && "bg-background/20",
            )}
            aria-label="Italic"
            aria-pressed={textStyles.isItalic}
            title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <HugeiconsIcon
              icon={TextItalicIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isUnderline && "bg-background/20",
            )}
            aria-label="Underline"
            aria-pressed={textStyles.isUnderline}
            title="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <HugeiconsIcon
              icon={TextUnderlineIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isLink && "bg-background/20",
            )}
            aria-label="Edit link"
            aria-pressed={textStyles.isLink}
            title="Link"
            onClick={editLink}
          >
            <HugeiconsIcon
              icon={Link01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isBulletList && "bg-background/20",
            )}
            aria-label="Bulleted list"
            aria-pressed={textStyles.isBulletList}
            title="Bulleted list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <HugeiconsIcon
              icon={LeftToRightListBulletIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              toolbarButtonClass,
              textStyles.isOrderedList && "bg-background/20",
            )}
            aria-label="Numbered list"
            aria-pressed={textStyles.isOrderedList}
            title="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <HugeiconsIcon
              icon={LeftToRightListNumberIcon}
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
