import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getProjects } from "../data/projects";
import { useAdminSession } from "../hooks/useAdminSession";
import type { PortfolioProject } from "../types/project";
import { ProjectDialog } from "./ProjectDialog";
import { Project } from "./Projects";

interface ProjectsSectionProps {
  heading?: string;
  emptyMessage?: string;
  headingEditor?: ReactNode;
  emptyMessageEditor?: ReactNode;
}

export function ProjectsSection({
  heading = "Projects",
  emptyMessage = "No projects yet, come back later :)",
  headingEditor,
  emptyMessageEditor,
}: ProjectsSectionProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const { isAdmin, session } = useAdminSession();
  const adminUserId = isAdmin ? session?.user.id : undefined;
  const projectGroups = useMemo(() => {
    const groups = new Map<number, PortfolioProject[]>();

    for (const project of projects) {
      const projectsForYear = groups.get(project.year) ?? [];
      projectsForYear.push(project);
      groups.set(project.year, projectsForYear);
    }

    return [...groups.entries()].sort(
      ([firstYear], [secondYear]) => secondYear - firstYear,
    );
  }, [projects]);

  useEffect(() => {
    let isActive = true;

    void getProjects()
      .then((savedProjects) => {
        if (isActive) {
          setProjects(savedProjects);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load projects from Supabase.", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleProjectSaved(project: PortfolioProject) {
    setProjects((currentProjects) => {
      const existingIndex = currentProjects.findIndex(
        (currentProject) => currentProject.id === project.id,
      );

      if (existingIndex === -1) {
        return [project, ...currentProjects];
      }

      return currentProjects.map((currentProject) =>
        currentProject.id === project.id ? project : currentProject,
      );
    });
  }

  return (
    <section
      className={`flex w-full flex-col gap-5 px-4 sm:px-0 ${
        headingEditor ? "@max-[28rem]/block:pt-9" : ""
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          <h2 className="text-muted-foreground">
            {headingEditor ?? heading}
          </h2>
          {adminUserId && (
            <ProjectDialog
              adminUserId={adminUserId}
              onProjectSaved={handleProjectSaved}
            />
          )}
        </div>
        <Separator />
      </div>

      <div className="flex flex-col gap-8">
        {projects.length === 0 ? (
          <div className="flex items-center text-muted-foreground">
            {emptyMessageEditor ?? emptyMessage}
          </div>
        ) : (
          projectGroups.map(([year, projectsForYear]) => (
            <div
              key={year}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8"
            >
              <div className="pt-1.5 text-muted-foreground tabular-nums">
                {year}
              </div>
              <div className="flex min-w-0 flex-col gap-5">
                {projectsForYear.map((project) => (
                  <Project
                    key={project.id}
                    project={project}
                    adminUserId={adminUserId}
                    onProjectSaved={handleProjectSaved}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
