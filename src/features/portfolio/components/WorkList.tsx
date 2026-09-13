import type { WorkItem as WorkItemData } from "../data/portfolio";
import { WorkItem } from "./WorkItem";

type WorkListProps = {
  items: WorkItemData[];
};

export function WorkList({ items }: WorkListProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-sans text-base font-semibold text-foreground">Work</h2>
      <ul role="list" className="flex flex-col">
        {items.map((item) => (
          <li key={item.name}>
            <WorkItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
