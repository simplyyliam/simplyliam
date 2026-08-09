import { useEffect, useRef } from "react";

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
      className="min-w-8 rounded-sm px-1 -mx-1 outline-none ring-ring/30 transition-shadow empty:before:text-muted-foreground empty:before:content-['Type_something…'] focus-visible:ring-2"
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
