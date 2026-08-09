import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineTextEditorProps {
  value: string;
  label: string;
  allowWrap?: boolean;
  multiline?: boolean;
  onChange: (value: string) => void;
}

export function InlineTextEditor({
  value,
  label,
  allowWrap = false,
  multiline = false,
  onChange,
}: InlineTextEditorProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const valueOnFocusRef = useRef(value);

  useEffect(() => {
    const element = elementRef.current;

    if (
      element &&
      document.activeElement !== element &&
      element.textContent !== value
    ) {
      element.textContent = value;
    }
  }, [value]);

  return (
    <span
      ref={elementRef}
      role="textbox"
      aria-label={label}
      aria-multiline={multiline}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "inline-block max-w-full min-w-8 rounded-md bg-muted/80 px-1.5 py-0.5 -mx-1.5 -my-0.5 caret-foreground outline-none selection:bg-neutral-400/50 selection:text-foreground transition-colors duration-150 empty:before:text-muted-foreground empty:before:content-['Type_something…'] focus-visible:bg-muted",
        allowWrap
          ? "wrap-break-word whitespace-normal"
          : !multiline && "whitespace-nowrap",
      )}
      onFocus={() => {
        valueOnFocusRef.current = value;
      }}
      onInput={(event) => {
        onChange(event.currentTarget.textContent ?? "");
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }

        if (event.key === "Escape") {
          event.currentTarget.textContent = valueOnFocusRef.current;
          onChange(valueOnFocusRef.current);
          event.currentTarget.blur();
        }
      }}
    />
  );
}
