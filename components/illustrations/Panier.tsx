"use client";

import type { ReactElement } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

type PanierProps = {
  /** 0 = panier vide, 1 = panier plein. Pilote l'apparition des objets. */
  fill: MotionValue<number>;
  className?: string;
  /** "dark" inverse les couleurs de trait pour rester visible sur fond brun. */
  variant?: "light" | "dark";
};

type ItemDef = {
  Shape: (props: { ink: string; paper: string }) => ReactElement;
  x: number;
  y: number;
  threshold: number;
  ex: number;
  ey: number;
};

const ITEMS: ItemDef[] = [
  { Shape: Boite, x: 112, y: 168, threshold: 0.15, ex: -60, ey: -95 },
  { Shape: Bouteille, x: 150, y: 158, threshold: 0.4, ex: 15, ey: -110 },
  { Shape: Sac, x: 186, y: 172, threshold: 0.65, ex: 70, ey: -80 },
  { Shape: Foulard, x: 134, y: 146, threshold: 0.85, ex: -30, ey: -120 },
];

// Illustration éditoriale d'un panier en osier, dessinée en SVG. Les objets
// à l'intérieur apparaissent/disparaissent un par un selon la valeur `fill`,
// pour incarner le "vidage" (constat) et le "remplissage" (simulateur).
export default function Panier({ fill, className, variant = "light" }: PanierProps) {
  const ink = variant === "dark" ? "#F3ECE1" : "#2B2117";
  const paper = variant === "dark" ? "#2B2117" : "#F3ECE1";

  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      className={className}
      role="img"
      aria-label="Illustration d'un panier de courses"
    >
      {ITEMS.map((item, i) => (
        <Item key={i} fill={fill} ink={ink} paper={paper} {...item} />
      ))}

      {/* Panier en osier */}
      <path
        d="M70 150 L105 260 Q160 275 215 260 L250 150"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 175 L242 175 M83 200 L237 200 M90 225 L230 225 M97 248 L223 248"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M70 150 Q160 172 250 150"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
        fill={paper}
      />
      <path
        d="M112 150 Q120 95 160 95 Q200 95 208 150"
        stroke="#B85C38"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Item({
  fill,
  Shape,
  x,
  y,
  threshold,
  ex,
  ey,
  ink,
  paper,
}: ItemDef & { fill: MotionValue<number>; ink: string; paper: string }) {
  const from = Math.max(threshold - 0.15, 0);
  const posX = useTransform(fill, [from, threshold], [x + ex, x], { clamp: true });
  const posY = useTransform(fill, [from, threshold], [y + ey, y], { clamp: true });
  const opacity = useTransform(fill, [from, threshold], [0, 1], { clamp: true });

  return (
    <motion.g style={{ x: posX, y: posY, opacity }}>
      <Shape ink={ink} paper={paper} />
    </motion.g>
  );
}

function Boite({ ink, paper }: { ink: string; paper: string }) {
  return (
    <g>
      <rect
        x="-16"
        y="-16"
        width="32"
        height="26"
        rx="3"
        stroke={ink}
        strokeWidth="3"
        fill={paper}
      />
      <path d="M-16 -6 L16 -6" stroke="#B85C38" strokeWidth="3" />
    </g>
  );
}

function Bouteille({ ink, paper }: { ink: string; paper: string }) {
  return (
    <g>
      <path
        d="M-6 -22 h12 v8 l6 8 v22 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-22 l6 -8 Z"
        stroke={ink}
        strokeWidth="3"
        fill={paper}
      />
      <path d="M-6 -22 h12" stroke="#B85C38" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Sac({ ink, paper }: { ink: string; paper: string }) {
  return (
    <g>
      <path
        d="M-15 -6 h30 l-3 24 a4 4 0 0 1 -4 3.5 h-16 a4 4 0 0 1 -4 -3.5 Z"
        stroke={ink}
        strokeWidth="3"
        fill={paper}
      />
      <path d="M-9 -6 v-6 a9 9 0 0 1 18 0 v6" stroke={ink} strokeWidth="3" fill="none" />
    </g>
  );
}

function Foulard({ paper }: { ink: string; paper: string }) {
  return (
    <g>
      <circle cx="0" cy="0" r="13" stroke="#B85C38" strokeWidth="3" fill={paper} />
      <path d="M-6 0 h12 M0 -6 v12" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}
