"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

// Charge uniquement le sous-ensemble de fonctionnalités d'animation
// réellement utilisé sur le site (pas de drag, pas de layout animations —
// vérifié sur tout le codebase avant ce choix) au lieu du bundle complet du
// composant `motion`. Les composants doivent utiliser `m` (import depuis
// framer-motion), pas `motion`, pour bénéficier de cet allègement — `strict`
// fait échouer explicitement toute utilisation restante de `motion`.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
