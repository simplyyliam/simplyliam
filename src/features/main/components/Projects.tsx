import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

import { ArrowRight } from "lucide-react";
import type { PortfolioProject } from "../types/project";
import { ProjectDialog } from "./ProjectDialog";

interface ProjectProps {
  project: PortfolioProject;
  adminUserId?: string;
  onProjectSaved: (project: PortfolioProject) => void;
}

export function Project({
  project,
  adminUserId,
  onProjectSaved,
}: ProjectProps) {
  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex h-fit w-full items-start justify-between gap-3 px-4 py-3 text-left sm:items-center sm:p-3"
    >
      <motion.a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center"
      >

        <Avatar>
          <AvatarImage
            src={project.avatar_url ?? "/favcon.png"}
            alt=""
          />
          <AvatarFallback>T.S</AvatarFallback>
        </Avatar>

        {/* Arrow — desktop only */}
        <motion.div
          className="hidden sm:block"
          variants={{
            rest: {
              visibility: "hidden",
              width: 0,
              opacity: 0,
              filter: "blur(4px)",
            },
            hover: {
              visibility: "visible",
              width: 16,
              opacity: 1,
              filter: "blur(0px)",
            },
          }}
        >
          <motion.div
            variants={{
              rest: { x: -8 },
              hover: { x: 0 },
            }}
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.div>

        {/* Project name */}
        <motion.span
          variants={{
            rest: { x: 0 },
            hover: { x: 4 },
          }}
          className="flex min-w-0 flex-1 flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2"
        >
          <span className="font-medium">{project.name}</span>
          <span className="max-w-full leading-relaxed text-pretty text-muted-foreground sm:border-b-3 sm:border-dotted sm:border-current">{project.description}</span>
        </motion.span>
      </motion.a>

      <div className="relative flex shrink-0 items-center gap-3">
        {adminUserId && (
          <>
            <div className="sm:hidden">
              <ProjectDialog
                adminUserId={adminUserId}
                project={project}
                onProjectSaved={onProjectSaved}
              />
            </div>
            <motion.div
              className="absolute right-full hidden pr-2 sm:block"
              variants={{
                rest: {
                  scale: 0.25,
                  opacity: 0,
                  filter: "blur(4px)",
                  pointerEvents: "none",
                  transitionEnd: {
                    visibility: "hidden",
                  },
                },
                hover: {
                  visibility: "visible",
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                  pointerEvents: "auto",
                },
              }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0,
              }}
            >
              <ProjectDialog
                adminUserId={adminUserId}
                project={project}
                onProjectSaved={onProjectSaved}
              />
            </motion.div>
          </>
        )}

        <span className="pt-1 text-xs tabular-nums sm:pt-0 sm:text-sm">
          {project.year}
        </span>
      </div>
    </motion.article>
  );
}
