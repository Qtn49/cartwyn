"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Panier from "@/components/illustrations/Panier";
import { BoutiqueIcon, LoupeIcon, RapportIcon } from "@/components/illustrations/StepIcons";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

const steps = [
  {
    title: "Audit gratuit",
    description:
      "Estimation chiffrée du CA actuellement perdu sur votre boutique, avant tout engagement.",
    Icon: LoupeIcon,
  },
  {
    title: "Installation suivie",
    description:
      "Connexion à votre boutique (Shopify/PrestaShop), mise en place des relances et du tracking, en quelques jours.",
    Icon: BoutiqueIcon,
  },
  {
    title: "Relances actives + reporting mensuel",
    description:
      "Premiers paniers relancés dès la première semaine, rapport mensuel transparent du CA récupéré.",
    Icon: RapportIcon,
  },
];

type CommentCaMarcheProps = {
  variant?: SectionVariant;
};

export default function CommentCaMarche({ variant = "dark" }: CommentCaMarcheProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <CommentCaMarcheStatic variant={variant} />;
  }

  return <CommentCaMarchePinned variant={variant} />;
}

function CommentCaMarcheStatic({ variant }: { variant: SectionVariant }) {
  const t = sectionTokens[variant];

  return (
    <section id="comment-ca-marche" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
          Comment ça marche
        </p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Trois étapes, sans complexité de votre côté.
        </h2>

        <div className="mt-14 grid gap-12 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <step.Icon className="h-16 w-16" ink={variant === "dark" ? "#F3ECE1" : "#2B2117"} />
              <p className="mt-4 text-sm font-medium text-terracotta">
                Étape {i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold">
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

function CommentCaMarchePinned({ variant }: { variant: SectionVariant }) {
  const t = sectionTokens[variant];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const fill = useTransform(scrollYProgress, [0, 0.66, 1], [0, 0, 0.6]);

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
            <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
              Comment ça marche
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-terracotta">
                  Étape {active + 1} / {steps.length}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
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
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i === active ? "bg-terracotta" : variant === "dark" ? "bg-creme/15" : "bg-brun/15"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <Panier fill={fill} className="h-auto w-full" variant={variant} />
            <AnimatePresence>
              {active === 0 && (
                <motion.div
                  key="loupe"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35 }}
                  className="absolute -right-2 top-4 w-16"
                >
                  <LoupeIcon className="h-16 w-16" ink={variant === "dark" ? "#F3ECE1" : "#2B2117"} />
                </motion.div>
              )}
              {active === 1 && (
                <motion.div
                  key="boutique"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35 }}
                  className="absolute -left-4 top-0 w-16"
                >
                  <BoutiqueIcon className="h-16 w-16" ink={variant === "dark" ? "#F3ECE1" : "#2B2117"} />
                  <svg
                    className="absolute left-16 top-8 h-8 w-16"
                    viewBox="0 0 64 32"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 16 H60"
                      stroke="#B85C38"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
