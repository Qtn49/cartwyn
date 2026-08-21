"use client";

import { m, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { stats, type Stat } from "@/lib/stats";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type ChiffresClesProps = {
  tone?: SectionTone;
};

// Renfort objectif après l'impact émotionnel de la section Douleur — c'est
// la seule respiration en encre profonde de la première moitié de la page.
export default function ChiffresCles({ tone = "ink" }: ChiffresClesProps) {
  const t = sectionTokens[tone];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-40">
        <p className="label text-sm font-medium text-bronze-on-ink">Chiffres clés</p>
        <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Ce n&apos;est pas une exception, c&apos;est le marché.
        </h2>

        <ul className="mt-16 grid gap-14 sm:grid-cols-3 lg:gap-8">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatItem({ stat, index }: { stat: Stat; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const decimals = Number.isInteger(stat.value) ? 0 : 2;

  return (
    <m.li
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
    >
      <p className="font-display text-4xl font-semibold text-bronze sm:text-5xl">
        <CountUp
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          decimals={decimals}
        />
      </p>
      <p className="mt-3 leading-relaxed">{stat.label}</p>
      <p className="mt-2 text-xs opacity-70">Source : {stat.source}</p>
    </m.li>
  );
}
