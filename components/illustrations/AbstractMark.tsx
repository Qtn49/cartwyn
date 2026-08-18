"use client";

import { motion, useReducedMotion } from "framer-motion";

type AbstractMarkProps = {
  className?: string;
};

// Trait géométrique minimaliste — jamais un objet reconnaissable. Se dessine
// au montage ; reste fixe si prefers-reduced-motion est activé.
export default function AbstractMark({ className }: AbstractMarkProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 200 320"
      fill="none"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <motion.line
        x1="100"
        y1="16"
        x2="100"
        y2="304"
        stroke="#8C5A34"
        strokeWidth="1"
        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <motion.line
        x1="58"
        y1="160"
        x2="142"
        y2="160"
        stroke="#8C5A34"
        strokeWidth="1"
        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
      />
      <motion.circle
        cx="100"
        cy="160"
        r="2.5"
        fill="#8C5A34"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.6 }}
      />
    </svg>
  );
}
