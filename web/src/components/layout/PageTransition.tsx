import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { DURATION, EASE, fadeInUp } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={prefersReduced ? false : fadeInUp.initial}
        animate={prefersReduced ? undefined : fadeInUp.animate}
        exit={prefersReduced ? undefined : fadeInUp.exit}
        transition={{
          duration: DURATION.page / 1000,
          ease: EASE.out,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
