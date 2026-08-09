import { PortfolioDocumentRenderer } from "@/features/portfolio-editor";

export default function Main() {
  return (
    <main className="flex min-h-dvh w-full justify-center sm:px-6 sm:py-2.5 md:px-10 lg:px-16">
      <div className="flex min-h-0 w-full max-w-174 flex-1 flex-col items-start gap-8 pb-8 lg:pt-40 sm:gap-10 sm:pb-10 lg:gap-12.5">
        <PortfolioDocumentRenderer />
      </div>
    </main>
  );
}
