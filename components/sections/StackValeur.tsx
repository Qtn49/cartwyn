"use client";

import { motion, useReducedMotion } from "framer-motion";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

const items = [
  {
    title: "Détection automatique des paniers abandonnés",
    description:
      "Chaque panier laissé en suspens sur votre boutique est identifié en temps réel.",
    Icon: IconRadar,
  },
  {
    title: "Relances multicanal",
    description: "Email, puis SMS/WhatsApp en option, au bon moment.",
    Icon: IconMessage,
  },
  {
    title: "Qualification du frein d'achat",
    description:
      "Chaque relance cherche à comprendre pourquoi l'achat n'a pas été finalisé.",
    Icon: IconQuestion,
  },
  {
    title: "Rapport mensuel de CA récupéré",
    description: "Chiffre attribué et estimation prudente, expliqués simplement.",
    Icon: IconReport,
  },
  {
    title: "Audit initial gratuit",
    description: "Estimation chiffrée du CA perdu, avant tout engagement.",
    Icon: IconSearch,
  },
  {
    title: "Diagnostic Checkout Avancé",
    description: "Option séparée : analyse approfondie de votre tunnel d'achat.",
    Icon: IconCheckout,
    option: true,
  },
];

type StackValeurProps = {
  variant?: SectionVariant;
};

export default function StackValeur({ variant = "light" }: StackValeurProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[variant];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
          Ce qui est inclus
        </p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Un socle complet, pensé pour le résultat.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              className={`rounded-2xl border p-6 ${
                item.option
                  ? "border-dashed border-terracotta/40 bg-creme-soft"
                  : "border-brun/10 bg-creme-soft"
              }`}
            >
              {item.option && (
                <span className="mb-3 inline-block rounded-full bg-terracotta/10 px-3 py-1 text-xs font-medium text-terracotta">
                  Option
                </span>
              )}
              <item.Icon className="h-10 w-10" />
              <h3 className="mt-4 font-display text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brun-soft">
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
      <circle cx="24" cy="24" r="18" stroke="#2B2117" strokeWidth="2.5" opacity="0.4" />
      <circle cx="24" cy="24" r="10" stroke="#2B2117" strokeWidth="2.5" opacity="0.6" />
      <circle cx="24" cy="24" r="3" fill="#B85C38" />
      <path d="M24 24 L36 14" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMessage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 12 h32 v20 h-20 l-8 8 v-8 h-4 Z"
        stroke="#2B2117"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M14 20 h20 M14 27 h12" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconQuestion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="#2B2117" strokeWidth="2.5" />
      <path
        d="M19 19 a5 5 0 1 1 7 4.5 c-1.5 1 -2 2 -2 4"
        stroke="#B85C38"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="33" r="1.6" fill="#B85C38" />
    </svg>
  );
}

function IconReport({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="7" width="28" height="34" rx="2" stroke="#2B2117" strokeWidth="2.5" />
      <path
        d="M16 30 l6 -9 l6 5 l8 -12"
        stroke="#B85C38"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="21" cy="21" r="12" stroke="#2B2117" strokeWidth="2.5" />
      <path d="M30 30 L40 40" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheckout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="14" width="32" height="22" rx="2" stroke="#2B2117" strokeWidth="2.5" />
      <path d="M8 21 h32" stroke="#2B2117" strokeWidth="2.5" />
      <path d="M15 29 l5 5 l11 -11" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
