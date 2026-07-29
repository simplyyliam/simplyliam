import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

import { ArrowRight } from "lucide-react";

interface ProjectProps {
  name: string;
  description: string;
  link: string;
  year: number;
}

export function Project({
  name,
  description,
  link,
  year,
}: ProjectProps) {
  return (
    <motion.a
      initial="rest"
      whileHover="hover"
      animate="rest"
      href={link || undefined}
      target={link ? "_blank" : undefined}
      rel={link ? "noreferrer" : undefined}
      aria-disabled={!link}
      className="flex h-fit w-full items-start justify-between gap-3 px-4 py-3 text-left sm:items-center sm:p-3"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">

        <Avatar>
          <AvatarImage src="/favcon.png" alt="" />
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
          <span className="font-medium">{name}</span>
          <span className="max-w-full leading-relaxed text-pretty text-muted-foreground sm:border-b-3 sm:border-dotted sm:border-current">{description}</span>
        </motion.span>
      </div>

      {/* Year */}
      <span className="shrink-0 pt-1 text-xs tabular-nums sm:pt-0 sm:text-sm">{year}</span>
    </motion.a>
  );
}
