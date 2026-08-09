import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import type { PortfolioProject } from "../types/project";
import { ProjectDeleteButton } from "./ProjectDeleteButton";
import { ProjectDialog } from "./ProjectDialog";

interface ProjectProps {
  project: PortfolioProject;
  adminUserId?: string;
  onProjectSaved: (project: PortfolioProject) => void;
  onProjectDeleted: (projectId: string) => void;
}

export function Project({
  project,
  adminUserId,
  onProjectSaved,
  onProjectDeleted,
}: ProjectProps) {
  const showAvatar = project.show_avatar;

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={cn(
        "group/project relative flex min-w-0 items-center gap-2 rounded-lg",
        adminUserId && "sm:pr-14",
        !showAvatar &&
          "-mx-2 px-2 transition-colors duration-200 hover:bg-muted/70",
      )}
    >
      <motion.a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left"
      >
        {showAvatar && (
          <>
            <Avatar className="shrink-0">
              <AvatarImage
                src={project.avatar_url ?? "/favcon.png"}
                alt=""
              />
              <AvatarFallback>
                {project.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

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
                transition={{
                  type: "spring",
                  duration: 0.3,
                  bounce: 0,
                }}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  aria-hidden="true"
                  size={16}
                  strokeWidth={2}
                />
              </motion.div>
            </motion.div>
          </>
        )}

        <motion.span
          variants={showAvatar
            ? {
                rest: { x: 0 },
                hover: { x: 4 },
              }
            : undefined}
          transition={showAvatar
            ? {
                type: "spring",
                duration: 0.3,
                bounce: 0,
              }
            : undefined}
          className="min-w-0 leading-relaxed"
        >
          <span className="font-medium text-foreground">
            {project.name}
          </span>{" "}
          <span className="text-pretty text-muted-foreground">
            — {project.description}
          </span>
        </motion.span>
      </motion.a>

      {adminUserId && (
        <>
          <div className="flex shrink-0 items-center gap-0.5 sm:hidden">
            <ProjectDialog
              adminUserId={adminUserId}
              project={project}
              onProjectSaved={onProjectSaved}
            />
            <ProjectDeleteButton
              project={project}
              onProjectDeleted={onProjectDeleted}
            />
          </div>
          <motion.div
            className="absolute right-0 hidden items-center gap-0.5 sm:flex"
            variants={{
              rest: {
                scale: 0.25,
                opacity: 0,
                filter: "blur(4px)",
                pointerEvents: "none",
                transitionEnd: { visibility: "hidden" },
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
            <ProjectDeleteButton
              project={project}
              onProjectDeleted={onProjectDeleted}
            />
          </motion.div>
        </>
      )}
    </motion.article>
  );
}
