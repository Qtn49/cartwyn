"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { pricingTiers } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

// Tous les paliers partagent le même nombre de places d'intégration prioritaire.
const prioritySlotsPerTier = pricingTiers[0].prioritySlotsTotal;

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
    question:
      "Pourquoi seulement " + prioritySlotsPerTier + " places d'intégration prioritaire par palier ?",
    answer:
      "Parce que l'accompagnement est personnalisé : chaque installation est suivie par l'équipe Cartwyn. C'est une capacité réelle, pas un argument marketing — une fois ces places prises, les nouveaux clients du palier sont simplement intégrés dans l'ordre d'arrivée.",
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
  tone?: SectionTone;
};

export default function FAQ({ tone = "creme" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = sectionTokens[tone];

  return (
    <section id="faq" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn className="text-center">
          <p className="label text-sm font-medium text-bronze">
            FAQ
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Questions fréquentes
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className={`mt-14 divide-y rounded-[3px] border ${t.border} ${t.divide}`}>
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
                    className={`shrink-0 text-xl text-bronze transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {/* Toujours présent dans le HTML servi (repli visuel en CSS,
                    jamais un démontage JSX) : un crawler qui n'exécute pas
                    de JS doit voir les 7 réponses, pas seulement celle
                    ouverte par défaut. */}
                <div
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={`px-6 pb-5 text-sm leading-relaxed ${t.textSoft}`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </FadeIn>
      </div>
    </section>
  );
}
