import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-1 px-4 sm:px-0">
        <h2 className="font-medium">{headingEditor ?? heading}</h2>
        {adminUserId && (
          <ProjectDialog
            adminUserId={adminUserId}
            onProjectSaved={handleProjectSaved}
          />
        )}
      </div>

      <div className="flex flex-col">
        {projects.length === 0 ? (
          <div className="flex items-center text-muted-foreground">
            {emptyMessageEditor ?? emptyMessage}
          </div>
        ) : (
          projects.map((project) => (
            <Project
              key={project.id}
              project={project}
              adminUserId={adminUserId}
              onProjectSaved={handleProjectSaved}
            />
          ))
        )}
      </div>
    </section>
  );
}
