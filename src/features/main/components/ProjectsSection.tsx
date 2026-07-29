import { useEffect, useState } from "react";
import { getProjects } from "../data/projects";
import { useAdminSession } from "../hooks/useAdminSession";
import type { PortfolioProject } from "../types/project";
import { AddProjectDialog } from "./AddProjectDialog";
import { Project } from "./Projects";

const existingProject: PortfolioProject = {
  id: "diddo-local",
  name: "Diddo",
  description:
    "Diddo is a native daily reflection app that appears at the end of your workday and asks one simple question:",
  link: "",
  year: 2026,
  created_at: "2026-01-01T00:00:00.000Z",
};

export function ProjectsSection() {
  const [projects, setProjects] = useState<PortfolioProject[]>([
    existingProject,
  ]);
  const { isAdmin } = useAdminSession();

  useEffect(() => {
    let isActive = true;

    void getProjects()
      .then((savedProjects) => {
        if (isActive) {
          setProjects([...savedProjects, existingProject]);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load projects from Supabase.", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleProjectAdded(project: PortfolioProject) {
    setProjects((currentProjects) => [project, ...currentProjects]);
  }

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-1 px-4 sm:px-0">
        <h2 className="font-medium">Projects</h2>
        {isAdmin && (
          <AddProjectDialog onProjectAdded={handleProjectAdded} />
        )}
      </div>

      <div className="flex flex-col">
        {projects.map((project) => (
          <Project
            key={project.id}
            name={project.name}
            description={project.description}
            link={project.link}
            year={project.year}
          />
        ))}
      </div>
    </section>
  );
}
