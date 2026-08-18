"use client";

import { motion, useReducedMotion } from "framer-motion";

type PlacesIndicatorProps = {
  total: number;
  restantes: number;
  variant?: "light" | "dark";
};

// Pastilles visuelles pour les places pilotes : les places prises pulsent
// doucement pour signaler la capacité limitée. Le nombre reste une valeur
// statique définie dans lib/pricing.ts — cette pulsation n'est pas branchée
// à une donnée temps réel.
export default function PlacesIndicator({
  total,
  restantes,
  variant = "dark",
}: PlacesIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const prises = total - restantes;
  const outlineColor = variant === "dark" ? "border-creme/30" : "border-brun/25";

  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${restantes} places disponibles sur ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const isPrise = i < prises;
        return (
          <motion.span
            key={i}
            className={`h-3 w-3 rounded-full ${
              isPrise ? "bg-terracotta" : `border ${outlineColor}`
            }`}
            animate={
              isPrise && !shouldReduceMotion
                ? { opacity: [1, 0.55, 1] }
                : undefined
            }
            transition={
              isPrise && !shouldReduceMotion
                ? { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
