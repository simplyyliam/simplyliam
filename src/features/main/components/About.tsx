import { Profiles } from "./Profile";
import { Skills } from "./Skill";

interface AboutProps {
  introduction: string;
  roles: string[];
  biography: string;
}

export const About = ({
  introduction,
  roles,
  biography,
}: AboutProps) => {
  return (
    <section className="flex w-full flex-col gap-3 px-4 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <Profiles />
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.75">
          <h1 className="font-medium">{introduction}</h1>
          <Skills roles={roles} />
        </div>
      </div>
      <p className="max-w-3xl text-pretty leading-relaxed text-muted-foreground">
        {biography}
      </p>
    </section>
  );
};
