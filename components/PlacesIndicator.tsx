"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SectionTone } from "@/components/section-variant";

type PlacesIndicatorProps = {
  total: number;
  restantes: number;
  tone?: SectionTone;
};

// Pastilles visuelles pour les places pilotes : les places prises pulsent
// doucement pour signaler la capacité limitée. Le nombre reste une valeur
// statique définie dans lib/pricing.ts — cette pulsation n'est pas branchée
// à une donnée temps réel.
export default function PlacesIndicator({
  total,
  restantes,
  tone = "ink",
}: PlacesIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const prises = total - restantes;
  const outlineColor = tone === "creme" ? "border-ink/25" : "border-creme/30";

  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${restantes} places disponibles sur ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const isPrise = i < prises;
        return (
          <motion.span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              isPrise ? "bg-bronze" : `border ${outlineColor}`
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
