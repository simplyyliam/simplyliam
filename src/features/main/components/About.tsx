import { Profiles } from "./Profile"
import { Skills } from "./Skill"

export const About = () => {
  return (
    <section className="flex w-full flex-col gap-3 px-4 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <Profiles />
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.75">
          <h1 className="font-medium">Hey, I&apos;m liam! I&apos;m a</h1>
          <Skills/>
        </div>
      </div>
      <p className="max-w-3xl text-pretty leading-relaxed text-muted-foreground">I&apos;m a curious person who enjoys bringing little ideas to life. I’m happiest when I’m learning, making things, and slowly turning something that once lived in my head into something real.</p>
    </section>
  )
}