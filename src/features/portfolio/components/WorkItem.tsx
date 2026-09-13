import { cn } from "@/lib/utils";
import type { WorkItem as WorkItemData } from "../data/portfolio";

type WorkItemProps = {
  item: WorkItemData;
};

export function WorkItem({ item }: WorkItemProps) {
  const content = (
    <>
      <span className="min-w-0 truncate font-mono text-sm text-foreground sm:text-base">
        {item.name}
      </span>
      <span className="size-8 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-9">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </span>
    </>
  );

  const rowClasses = cn(
    "flex items-center justify-between gap-4 py-3.5 sm:py-3",
    "transition-opacity hover:opacity-70",
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(rowClasses, "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring")}
      >
        {content}
      </a>
    );
  }

  return <div className={rowClasses}>{content}</div>;
}
