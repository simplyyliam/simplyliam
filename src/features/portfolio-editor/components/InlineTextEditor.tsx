import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineTextEditorProps {
  value: string;
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}

export function InlineTextEditor({
  value,
  label,
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
        "min-w-8 rounded-md bg-muted/80 px-1.5 py-0.5 -mx-1.5 -my-0.5 caret-foreground outline-none ring-ring/30 selection:bg-neutral-400/50 selection:text-foreground transition-[background-color,box-shadow] duration-150 empty:before:text-muted-foreground empty:before:content-['Type_something…'] focus-visible:bg-muted focus-visible:ring-2",
        !multiline && "whitespace-nowrap",
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
