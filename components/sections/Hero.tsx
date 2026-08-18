"use client";

import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import Panier from "@/components/illustrations/Panier";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

const badges = [
  "Hébergement France/UE",
  "Conforme RGPD",
  "Installation suivie personnellement",
];

type HeroProps = {
  variant?: SectionVariant;
};

export default function Hero({ variant = "light" }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const fill = useMotionValue(1);
  const t = sectionTokens[variant];

  return (
    <section className={`relative overflow-hidden px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28 ${t.bg} ${t.text}`}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Chaque panier abandonné a une histoire.{" "}
            <span className="text-terracotta">
              La vôtre peut encore bien finir.
            </span>
          </h1>
          <p className={`mt-6 max-w-xl text-lg leading-relaxed ${t.textSoft}`}>
            Cartwyn relance automatiquement vos paniers abandonnés et
            qualifie chaque prospect, avec un suivi personnalisé à chaque
            installation.
          </p>
          <div className="mt-8">
            <a
              href="#contact"
              className="inline-block rounded-full bg-terracotta px-7 py-3.5 text-base font-medium text-creme transition-colors hover:bg-terracotta-dark"
            >
              Recevoir mon audit gratuit
            </a>
          </div>
          <ul className={`mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.textSoft}`}>
            {badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                {badge}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="mx-auto w-full max-w-sm"
        >
          <Panier fill={fill} className="h-auto w-full" />
        </motion.div>
      </div>
    </section>
  );
}
