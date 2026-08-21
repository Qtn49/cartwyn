"use client";

import { useRef } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Signature from "@/components/illustrations/Signature";
import { pricingTiers } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

// Tous les paliers partagent le même nombre de places d'intégration prioritaire.
const prioritySlotsPerTier = pricingTiers[0].prioritySlotsTotal;

const paragraphs = [
  <>
    Cartwyn est né d&apos;un constat simple : la plupart des e-commerçants
    perdent chaque mois <strong>un chiffre d&apos;affaires qu&apos;ils ont
    déjà généré</strong> — des clients qui ont rempli leur panier, puis sont
    partis <strong>sans relance sérieuse</strong> pour les faire revenir.
  </>,
  <>
    Notre approche reste volontairement transparente : la méthode de calcul
    du CA récupéré est publique, <strong>mesurée par groupe témoin</strong>,
    et <strong>jamais gonflée pour impressionner</strong>.
  </>,
  <>
    L&apos;équipe Cartwyn <strong>suit personnellement chaque installation</strong>,
    de l&apos;audit initial au premier rapport mensuel — l&apos;automatisation
    fait le travail répétitif, <strong>l&apos;équipe garde le contrôle sur la
    qualité</strong>.
  </>,
  <>
    Cartwyn démarre volontairement petit :{" "}
    <strong>{prioritySlotsPerTier} places d&apos;intégration prioritaire par palier tarifaire</strong>,
    pour garantir <strong>un accompagnement de qualité</strong> plutôt que de
    viser le volume dès le premier jour.
  </>,
];

type AProposProps = {
  tone?: SectionTone;
};

export default function APropos({ tone = "creme" }: AProposProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.4"],
  });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const staticProgress = useMotionValue(1);
  const progress = shouldReduceMotion ? staticProgress : scrollProgress;

  return (
    <section ref={sectionRef} className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn>
          <p className="label text-sm font-medium text-bronze">
            À propos
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Une méthode, une marque — pas une promesse en l&apos;air.
          </h2>
        </FadeIn>

        <Signature progress={progress} className="mt-12 h-16 w-40" />

        <div className={`mt-8 space-y-5 text-lg leading-relaxed ${t.textSoft}`}>
          {paragraphs.map((paragraph, i) => (
            <m.p
              key={i}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 }}
            >
              {paragraph}
            </m.p>
          ))}
        </div>
      </div>
    </section>
  );
}
