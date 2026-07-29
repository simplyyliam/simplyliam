import { About, Project } from "@/features/main/components";
import { Banner } from "@/widgets/banner";

export default function Main() {
  return (
    <main className="flex min-h-dvh w-full justify-center sm:px-6 sm:py-2.5 md:px-10 lg:px-16">
      <div className="flex min-h-0 w-full max-w-264 flex-1 flex-col items-start gap-8 pb-8 sm:gap-10 sm:pb-10 lg:gap-12.5">
        <Banner />
        <About />
        <h1 className="px-4 font-medium sm:px-0">Projects</h1>
        <Project Name="Diddo" Description="Diddo is a native daily reflection app that appears at the end of your workday and asks one simple question:"/>
      </div>
    </main>
  );
}
