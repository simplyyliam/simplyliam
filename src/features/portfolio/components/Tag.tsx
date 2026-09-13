import { cn } from "@/lib/utils";

type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full bg-muted px-3.5 py-1.75",
        "font-mono text-xs text-foreground align-middle sm:text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
