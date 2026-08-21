"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import CtaButton from "@/components/CtaButton";
import { trackEvent } from "@/lib/analytics";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const steps = [
  {
    title: "Audit gratuit",
    description:
      "Estimation chiffrée du CA actuellement perdu sur votre boutique, avant tout engagement.",
  },
  {
    title: "Installation suivie",
    description:
      "Connexion à votre boutique (Shopify/PrestaShop), mise en place des relances et du tracking, en quelques jours.",
  },
  {
    title: "Relances actives + reporting mensuel",
    description:
      "Premiers paniers relancés dès la première semaine, rapport mensuel transparent du CA récupéré.",
  },
];

type CommentCaMarcheProps = {
  tone?: SectionTone;
};

export default function CommentCaMarche({ tone = "creme-soft" }: CommentCaMarcheProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <CommentCaMarcheStatic tone={tone} />;
  }

  return <CommentCaMarchePinned tone={tone} />;
}

function CommentCaMarcheStatic({ tone }: { tone: SectionTone }) {
  const t = sectionTokens[tone];

  return (
    <section id="comment-ca-marche" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <p className="label text-sm font-medium text-bronze">
          Comment ça marche
        </p>
        <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Trois étapes, sans complexité de votre côté.
        </h2>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              {/* text-ink/60 plutôt que text-bronze/40 : à cette opacité, le
                  bronze ne passe pas 4.5:1 sur fond crème (mesuré à 1.7:1),
                  ink/60 atteint 4.72:1 en restant visuellement discret. */}
              <p className="font-display text-4xl font-semibold text-ink/60">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className={`mt-2 leading-relaxed ${t.textSoft}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <m.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-16 text-center"
        >
          <CtaButton
            href="#contact"
            tone={tone}
            onClick={() => trackEvent("CTA cliqué", { emplacement: "comment-ca-marche" })}
          >
            Recevoir mon audit gratuit
          </CtaButton>
        </m.div>
      </div>
    </section>
  );
}

function CommentCaMarchePinned({ tone }: { tone: SectionTone }) {
  const t = sectionTokens[tone];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.min(steps.length - 1, Math.floor(latest * steps.length));
    setActive(next);
  });

  return (
    <section
      id="comment-ca-marche"
      ref={sectionRef}
      className={`relative ${t.bg} ${t.text}`}
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-5 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="label text-sm font-medium text-bronze">
              Comment ça marche
            </p>
            {/* Les 3 étapes restent toutes montées (empilées via CSS grid,
                une seule cellule) plutôt que démontées/remontées par
                AnimatePresence — comme pour la FAQ, le texte des 3 étapes
                doit rester dans le HTML servi, pas seulement celle active. */}
            <div className="relative mt-5 grid">
              {steps.map((step, i) => (
                <m.div
                  key={step.title}
                  aria-hidden={i !== active}
                  style={{ gridArea: "1 / 1" }}
                  initial={{ opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 16 }}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : i < active ? -16 : 16,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={i === active ? "" : "pointer-events-none"}
                >
                  <p className="label text-sm font-medium text-bronze">
                    Étape {i + 1} / {steps.length}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className={`mt-4 max-w-md text-lg leading-relaxed ${t.textSoft}`}>
                    {step.description}
                  </p>
                </m.div>
              ))}
            </div>

            <div className="mt-10 flex gap-2">
              {steps.map((step, i) => (
                <span
                  key={step.title}
                  className={`h-px flex-1 transition-colors duration-300 ${
                    i === active ? "bg-bronze" : t.line
                  }`}
                />
              ))}
            </div>

            <AnimatePresence>
              {active === steps.length - 1 && (
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  className="mt-10"
                >
                  <CtaButton
            href="#contact"
            tone={tone}
            onClick={() => trackEvent("CTA cliqué", { emplacement: "comment-ca-marche" })}
          >
            Recevoir mon audit gratuit
          </CtaButton>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
            {/* Décoratif et redondant avec "Étape X / 3" ci-contre (déjà
                accessible et SSR sur les 3 étapes) — aria-hidden, pas besoin
                d'être toutes montées comme le bloc de texte. */}
            <AnimatePresence mode="wait">
              <m.p
                key={active}
                aria-hidden="true"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display text-[140px] font-semibold leading-none text-ink/60 sm:text-[200px]"
              >
                {String(active + 1).padStart(2, "0")}
              </m.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
