import { About } from "@/features/main/components";
import { Banner } from "@/widgets/banner";

export default function Main() {
  return (
    <main className="flex min-h-dvh w-full justify-center sm:px-6 sm:py-2.5 md:px-10 lg:px-16">
      <div className="flex flex-col items-start min-h-0 w-full max-w-264 flex-1 gap-12.5" >
        <Banner />
        <About/>
      </div>
    </main>
  );
}
