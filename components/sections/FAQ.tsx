"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { placesDisponibles } from "@/lib/pricing";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

const faqs = [
  {
    question: "Ça fonctionne avec quelle plateforme ?",
    answer: "Shopify et PrestaShop, les deux plateformes les plus utilisées par les e-commerçants français dans notre cible.",
  },
  {
    question: "Combien de temps avant de voir des résultats ?",
    answer:
      "L'installation se fait en quelques jours. Les premiers paniers sont relancés dès la première semaine, et le premier rapport de CA récupéré arrive à la fin du premier mois.",
  },
  {
    question: "Que se passe-t-il si ça ne fonctionne pas ?",
    answer:
      "Nous continuons à ajuster les relances et la qualification avec vous jusqu'à obtenir un résultat mesurable, plutôt qu'un simple remboursement. Voir la section garantie.",
  },
  {
    question: "Est-ce que mes données clients sont en sécurité ?",
    answer:
      "Oui : hébergement en France/UE, conformité RGPD, et aucune donnée revendue ou partagée à des tiers en dehors des outils strictement nécessaires à l'envoi des relances.",
  },
  {
    question: "Pourquoi seulement " + placesDisponibles.total + " places pilotes ?",
    answer:
      "Parce que l'accompagnement est personnalisé : chaque installation est suivie par l'équipe Cartwyn. C'est une capacité réelle, pas un argument marketing.",
  },
  {
    question: "Pourquoi l'installation est-elle offerte ?",
    answer:
      "Pour ne pas créer de frein à l'essai. L'engagement réel se fait sur l'abonnement, et le résultat est mesuré dès le premier mois — nous n'avons donc pas besoin de facturer l'installation pour être sérieux.",
  },
  {
    question: "Comment est calculé le CA récupéré ?",
    answer:
      "Via une méthode à groupe témoin : nous comparons le CA généré par les paniers relancés à celui des paniers volontairement non relancés. Voir la section Méthode de calcul pour le détail.",
  },
];

type FAQProps = {
  variant?: SectionVariant;
};

export default function FAQ({ variant = "light" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[variant];

  return (
    <section id="faq" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <FadeIn className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Questions fréquentes
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-12 divide-y divide-brun/10 rounded-2xl border border-brun/10 bg-creme-soft">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  <span
                    className={`shrink-0 text-xl text-terracotta transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-brun-soft">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </FadeIn>
      </div>
    </section>
  );
}
