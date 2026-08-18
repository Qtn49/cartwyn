"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

type SignatureProps = {
  /** 0 = trait invisible, 1 = trait complet. */
  progress: MotionValue<number>;
  className?: string;
};

// Marque graphique abstraite (un trait continu, dans l'esprit d'une
// signature de marque) qui se dessine progressivement au scroll — jamais un
// portrait ni un visage, cf. CLAUDE.md règle "pas de storytelling personnel".
export default function Signature({ progress, className }: SignatureProps) {
  const pathLength = useTransform(progress, [0, 1], [0, 1]);

  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Trait graphique abstrait Cartwyn"
    >
      <motion.path
        d="M12 90 C 40 20, 70 20, 90 60 C 108 96, 130 96, 150 55 C 165 25, 185 25, 198 50 C 208 68, 220 60, 228 40"
        stroke="#B85C38"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ pathLength }}
      />
    </svg>
  );
}
