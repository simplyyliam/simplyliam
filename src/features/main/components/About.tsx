import { Profiles } from "./Profile";
import { Skills } from "./Skill";
import type { ReactNode } from "react";

interface AboutProps {
  introduction: string;
  roles: string[];
  biography: string;
  biographyContent?: ReactNode;
  introductionEditor?: ReactNode;
  rolesEditor?: ReactNode;
  biographyEditor?: ReactNode;
}

export const About = ({
  introduction,
  roles,
  biography,
  biographyContent,
  introductionEditor,
  rolesEditor,
  biographyEditor,
}: AboutProps) => {
  return (
    <section className="flex w-full flex-col gap-3 px-4 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <Profiles />
        <div className="flex min-w-0 flex-nowrap items-baseline gap-x-1.75">
          <h1 className="shrink-0 whitespace-nowrap font-medium">
            {introductionEditor ?? introduction}
          </h1>
          {rolesEditor ?? <Skills roles={roles} />}
        </div>
      </div>
      {biographyEditor ?? (
        biographyContent ?? (
          <p className="max-w-3xl text-pretty leading-relaxed text-muted-foreground">
            {biography}
          </p>
        )
      )}
    </section>
  );
};
