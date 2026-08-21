"use client";

import { motion, useReducedMotion } from "framer-motion";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const items = [
  {
    pain: "Vous perdez des paniers sans même le voir venir",
    title: "Détection automatique des paniers abandonnés",
    description:
      "Chaque panier laissé en suspens sur votre boutique est identifié en temps réel.",
    Icon: IconRadar,
  },
  {
    pain: "Vos relances, quand elles existent, arrivent au mauvais moment ou sur un seul canal",
    title: "Relances multicanal",
    description: "Email, puis SMS/WhatsApp en option, au bon moment.",
    Icon: IconMessage,
  },
  {
    pain: "Vous ne savez pas pourquoi vos clients partent",
    title: "Qualification du frein d'achat",
    description:
      "Chaque relance cherche à comprendre pourquoi l'achat n'a pas été finalisé.",
    Icon: IconQuestion,
  },
  {
    pain: "Vous n'avez aucune visibilité sur ce que ces relances rapportent vraiment",
    title: "Rapport mensuel de CA récupéré",
    description: "Chiffre attribué et estimation prudente, expliqués simplement.",
    Icon: IconReport,
  },
  {
    pain: "Vous hésitez à vous engager sans savoir combien vous perdez réellement",
    title: "Audit initial gratuit",
    description: "Estimation chiffrée du CA perdu, avant tout engagement.",
    Icon: IconSearch,
  },
  {
    pain: "Votre tunnel d'achat cache peut-être des frictions invisibles",
    title: "Diagnostic Checkout Avancé",
    description: "Option séparée : analyse approfondie de votre tunnel d'achat.",
    Icon: IconCheckout,
    option: true,
  },
];

type ExpertiseProps = {
  tone?: SectionTone;
};

export default function Expertise({ tone = "creme" }: ExpertiseProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-36">
        <p className="label text-sm font-medium text-bronze">
          Expertise Cartwyn
        </p>
        <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
          À chaque point de friction, une réponse précise — pour augmenter
          votre taux de conversion.
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              className={`rounded-[3px] border p-6 ${
                item.option ? "border-dashed border-bronze/50" : t.border
              }`}
            >
              {item.option && (
                <span className="label mb-3 inline-block border border-bronze/40 px-2.5 py-1 text-[10px] font-medium text-bronze">
                  Option
                </span>
              )}
              <item.Icon className="h-8 w-8" />
              <p className={`mt-4 text-sm italic leading-relaxed ${t.textSoft}`}>
                {item.pain}
              </p>
              <p className="mt-2 text-bronze" aria-hidden="true">
                →
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">
                {item.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconRadar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="#12100D" strokeWidth="1.5" opacity="0.4" />
      <circle cx="24" cy="24" r="10" stroke="#12100D" strokeWidth="1.5" opacity="0.6" />
      <circle cx="24" cy="24" r="3" fill="#8C5A34" />
      <path d="M24 24 L36 14" stroke="#8C5A34" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMessage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 12 h32 v20 h-20 l-8 8 v-8 h-4 Z"
        stroke="#12100D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 20 h20 M14 27 h12" stroke="#8C5A34" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconQuestion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="#12100D" strokeWidth="1.5" />
      <path
        d="M19 19 a5 5 0 1 1 7 4.5 c-1.5 1 -2 2 -2 4"
        stroke="#8C5A34"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="33" r="1.4" fill="#8C5A34" />
    </svg>
  );
}

function IconReport({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="7" width="28" height="34" rx="1" stroke="#12100D" strokeWidth="1.5" />
      <path
        d="M16 30 l6 -9 l6 5 l8 -12"
        stroke="#8C5A34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="21" cy="21" r="12" stroke="#12100D" strokeWidth="1.5" />
      <path d="M30 30 L40 40" stroke="#8C5A34" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheckout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="14" width="32" height="22" rx="1" stroke="#12100D" strokeWidth="1.5" />
      <path d="M8 21 h32" stroke="#12100D" strokeWidth="1.5" />
      <path d="M15 29 l5 5 l11 -11" stroke="#8C5A34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
