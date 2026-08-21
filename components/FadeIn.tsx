"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

// Apparition sobre (fondu + translation courte) réservée aux sections
// tarifs/garantie/FAQ/contact : le "wow" reste concentré sur la 1re moitié.
export default function FadeIn({ children, delay = 0, y = 20, className }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}
