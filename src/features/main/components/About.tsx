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
    <section
      className={`flex w-full flex-col gap-3 px-4 sm:px-0 ${
        introductionEditor ? "@max-[28rem]/block:pt-9" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <Profiles />
        <div
          className={`flex min-w-0 flex-1 flex-wrap items-baseline ${
            introductionEditor || rolesEditor
              ? "gap-x-4 gap-y-3"
              : "gap-x-1.75 gap-y-1"
          }`}
        >
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
