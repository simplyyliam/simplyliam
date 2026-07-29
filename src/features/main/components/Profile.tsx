import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

export function Profiles() {
  const swap = {
    initial: (dir: number) => ({
      x: 0,
      zIndex: dir > 1 ? 2 : 1,
    }),
    hover: (dir: number) => ({
      x: dir * 20,
      zIndex: dir > 1 ? 1 : 2,
    }),
  };

  return (
    <motion.div
      className="flex -space-x-4 sm:-space-x-4"
      // Variant labels
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        // Variant Controller
        variants={swap}
        // Custom injects values into variant methods (dir: number)
        custom={1}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Avatar>
          <AvatarImage src="/favcon.png" />
          <AvatarFallback>S.L</AvatarFallback>
        </Avatar>
      </motion.div>
      <motion.div
        variants={swap}
        custom={-1}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Avatar>
          <AvatarImage src="/pfp.png" />
          <AvatarFallback>S.L</AvatarFallback>
        </Avatar>
      </motion.div>
    </motion.div>
  );
}
