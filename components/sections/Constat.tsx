"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Panier from "@/components/illustrations/Panier";
import CountUp from "@/components/CountUp";
import { stats, type Stat } from "@/lib/stats";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

type ConstatProps = {
  variant?: SectionVariant;
};

export default function Constat({ variant = "light" }: ConstatProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const scrollFill = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const staticFill = useMotionValue(0);
  const fill = shouldReduceMotion ? staticFill : scrollFill;
  const t = sectionTokens[variant];

  return (
    <section ref={sectionRef} id="constat" className={`relative ${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
              Le constat
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Sans relance structurée, ce panier reste vide.
            </h2>
            <div className="mx-auto mt-10 max-w-xs">
              <Panier fill={fill} className="h-auto w-full" variant={variant} />
            </div>
          </div>

          <ul className="flex flex-col gap-14 lg:gap-20 lg:pt-4">
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatItem({ stat }: { stat: Stat }) {
  const shouldReduceMotion = useReducedMotion();
  const decimals = Number.isInteger(stat.value) ? 0 : 2;

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="font-display text-5xl font-semibold text-terracotta sm:text-6xl">
        <CountUp
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          decimals={decimals}
        />
      </p>
      <p className="mt-3 max-w-md text-lg leading-relaxed">{stat.label}</p>
      <p className="mt-2 text-xs opacity-70">Source : {stat.source}</p>
    </motion.li>
  );
}
