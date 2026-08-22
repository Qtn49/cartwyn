"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();
  // Initialisé à la vraie valeur (pas 0) : le HTML servi par le serveur doit
  // toujours contenir la valeur réelle, jamais un placeholder — voir
  // CLAUDE.md, règle transversale sur le contenu animé. L'effet de comptage
  // ci-dessous reste un enrichissement purement visuel côté client.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, shouldReduceMotion]);

  const shown = shouldReduceMotion ? value : display;
  const formatted =
    decimals > 0 ? shown.toFixed(decimals) : Math.round(shown).toString();

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
