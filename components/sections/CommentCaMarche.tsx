"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
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

export default function CommentCaMarche({ tone = "ink-soft" }: CommentCaMarcheProps) {
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
              <p className="font-display text-4xl font-semibold text-bronze/40">
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
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-5"
              >
                <p className="label text-sm font-medium text-bronze">
                  Étape {active + 1} / {steps.length}
                </p>
                <h3 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  {steps[active].title}
                </h3>
                <p className={`mt-4 max-w-md text-lg leading-relaxed ${t.textSoft}`}>
                  {steps[active].description}
                </p>
              </motion.div>
            </AnimatePresence>

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
          </div>

          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display text-[140px] font-semibold leading-none text-bronze/25 sm:text-[200px]"
              >
                {String(active + 1).padStart(2, "0")}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
