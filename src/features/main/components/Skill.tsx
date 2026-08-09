import { AnimatePresence, motion } from "motion/react";
import { useTextLoop } from "../hooks/useTextLoop";

interface SkillsProps {
  roles: string[];
}

export function Skills({ roles }: SkillsProps) {
  const interest = useTextLoop(roles.length > 0 ? roles : [""]);

  return (
    <div className="flex h-6 w-24 items-center overflow-hidden font-medium sm:w-28">
      <AnimatePresence mode="wait">
        <motion.span
          key={interest}
          initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -13, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="border-b-2 border-dotted border-current leading-none text-muted-foreground"
        >
          {interest}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
