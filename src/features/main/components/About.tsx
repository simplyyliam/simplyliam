import { Profiles } from "./Profile"
import { Skills } from "./Skill"

export const About = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 sm:flex-row flex-col sm:items-center items-start">
        <Profiles />
        <div className="flex items-center justify-center gap-1.75 flex-wrap">
          <h1 className="font-medium">Hey, I&apos;m liam! I&apos;m a</h1>
          <Skills/>
        </div>
      </div>
      <p className="text-muted-foreground">I&apos;m a curious person who enjoys bringing little ideas to life. I’m happiest when I’m learning, making things, and slowly turning something that once lived in my head into something real. </p>
    </div>
  )
}
