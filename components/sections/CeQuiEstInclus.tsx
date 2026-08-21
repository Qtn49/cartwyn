"use client";

import { m, useReducedMotion } from "framer-motion";
import CtaButton from "@/components/CtaButton";
import { trackEvent } from "@/lib/analytics";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const items = [
  "Détection temps réel des paniers abandonnés",
  "Relances email, puis SMS/WhatsApp en option",
  "Qualification du frein d'achat à chaque relance",
  "Rapport mensuel de CA récupéré (méthode à groupe témoin)",
  "Audit initial gratuit, avant tout engagement",
  "Diagnostic Checkout Avancé (option séparée)",
  "Zéro frais d'installation",
  "Hébergement France/UE, conforme RGPD",
  "Installation et suivi personnalisés par l'équipe Cartwyn",
];

type CeQuiEstInclusProps = {
  tone?: SectionTone;
};

// Liste exhaustive et scannable des livrables — volontairement distincte de
// la grille "Expertise" (qui mappe chaque capacité à un point de douleur)
// pour éviter la redondance.
export default function CeQuiEstInclus({ tone = "creme-soft" }: CeQuiEstInclusProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-36">
        <p className="label text-sm font-medium text-bronze">
          Ce qui est inclus
        </p>
        <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Un socle complet, pensé pour le résultat.
        </h2>

        <ul className="mt-14 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <m.li
              key={item}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.04 }}
              className="flex items-start gap-3"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="mt-1 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M3 8.5 L6.5 12 L13 4.5"
                  stroke="#8C5A34"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="leading-relaxed">{item}</span>
            </m.li>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <CtaButton
            href="#contact"
            tone={tone}
            onClick={() => trackEvent("CTA cliqué", { emplacement: "ce-qui-est-inclus" })}
          >
            Recevoir mon audit gratuit
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
