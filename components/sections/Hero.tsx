"use client";

import { m, useReducedMotion } from "framer-motion";
import AbstractMark from "@/components/illustrations/AbstractMark";
import SmsMockup from "@/components/SmsMockup";
import CtaButton from "@/components/CtaButton";
import { trackEvent } from "@/lib/analytics";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const badges = [
  "Hébergement France/UE",
  "Conforme RGPD",
  "Installation suivie personnellement",
];

type HeroProps = {
  tone?: SectionTone;
};

export default function Hero({ tone = "creme" }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  return (
    <section className={`relative overflow-hidden px-5 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32 ${t.bg} ${t.text}`}>
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <m.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <AbstractMark className="h-14 w-7" />
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Faire croître son chiffre d&apos;affaires, ce n&apos;est pas
            toujours attirer plus de trafic.{" "}
            <span className="text-bronze">
              Parfois, c&apos;est simplement retenir ceux qui étaient déjà
              prêts à acheter.
            </span>
          </h1>
          <p className={`mt-7 max-w-xl text-lg leading-relaxed ${t.textSoft}`}>
            Cartwyn relance automatiquement vos paniers abandonnés et
            qualifie chaque prospect, avec un suivi personnalisé à chaque
            installation.
          </p>
          <div className="mt-10">
            <CtaButton
              href="#contact"
              tone={tone}
              onClick={() => trackEvent("CTA cliqué", { emplacement: "hero" })}
            >
              Recevoir mon audit gratuit
            </CtaButton>
          </div>
          <ul className={`mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.textSoft}`}>
            {badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-bronze" />
                {badge}
              </li>
            ))}
          </ul>
        </m.div>

        <div className="mx-auto w-full max-w-sm">
          <SmsMockup />
        </div>
      </div>
    </section>
  );
}
