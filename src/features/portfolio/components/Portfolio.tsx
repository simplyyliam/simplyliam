import { portfolio } from "../data/portfolio";
import { Bio } from "./Bio";
import { WorkList } from "./WorkList";

export function Portfolio() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-xl px-5 py-12 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-8 sm:gap-10">
        {/*<Avatar src={portfolio.avatar} alt={portfolio.name} />*/}

        <section className="flex flex-col gap-5 sm:gap-6">
          <h1 className="font-sans text-base font-semibold text-foreground">
            {portfolio.name}
          </h1>
          <Bio />
        </section>

        <WorkList items={portfolio.work} />
      </div>
    </main>
  );
}
