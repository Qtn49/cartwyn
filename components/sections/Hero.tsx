"use client";

import { motion, useReducedMotion } from "framer-motion";
import AbstractMark from "@/components/illustrations/AbstractMark";
import CtaButton from "@/components/CtaButton";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const badges = [
  "Hébergement France/UE",
  "Conforme RGPD",
  "Installation suivie personnellement",
];

type HeroProps = {
  tone?: SectionTone;
};

export default function Hero({ tone = "ink" }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  return (
    <section className={`relative overflow-hidden px-5 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32 ${t.bg} ${t.text}`}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Chaque panier abandonné a une histoire.{" "}
            <span className="text-bronze">
              La vôtre peut encore bien finir.
            </span>
          </h1>
          <p className={`mt-7 max-w-xl text-lg leading-relaxed ${t.textSoft}`}>
            Cartwyn relance automatiquement vos paniers abandonnés et
            qualifie chaque prospect, avec un suivi personnalisé à chaque
            installation.
          </p>
          <div className="mt-10">
            <CtaButton href="#contact">Recevoir mon audit gratuit</CtaButton>
          </div>
          <ul className={`mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.textSoft}`}>
            {badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-bronze" />
                {badge}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="mx-auto hidden w-full max-w-[200px] lg:block">
          <AbstractMark className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
