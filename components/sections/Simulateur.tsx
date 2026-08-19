"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import CtaButton from "@/components/CtaButton";
import { simulateur } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

const FILL_REFERENCE_CA = 8000; // CA récupérable au-delà duquel la jauge est pleine

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

type SimulateurProps = {
  tone?: SectionTone;
};

export default function Simulateur({ tone = "creme-soft" }: SimulateurProps) {
  const [commandes, setCommandes] = useState(300);
  const [panierMoyen, setPanierMoyen] = useState(65);
  const shouldReduceMotion = useReducedMotion();
  const fill = useMotionValue(0);
  const t = sectionTokens[tone];
  const gaugeScaleX = useTransform(fill, (v) => v);
  const numberScale = useTransform(fill, [0, 1], [0.94, 1.06]);

  const { paniersAbandonnes, caPerdu, caRecuperable } = useMemo(() => {
    const ratio = simulateur.tauxAbandon / (1 - simulateur.tauxAbandon);
    const paniersAbandonnes = commandes * ratio;
    const caPerdu = paniersAbandonnes * panierMoyen;
    const caRecuperable = caPerdu * simulateur.tauxRecuperation;
    return { paniersAbandonnes, caPerdu, caRecuperable };
  }, [commandes, panierMoyen]);

  useEffect(() => {
    const target = Math.min(caRecuperable / FILL_REFERENCE_CA, 1);
    if (shouldReduceMotion) {
      fill.set(target);
      return;
    }
    const controls = animate(fill, target, { duration: 0.5, ease: "easeOut" });
    return () => controls.stop();
  }, [caRecuperable, fill, shouldReduceMotion]);

  return (
    <section id="simulateur" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-36">
        <div className="text-center">
          <p className="label text-sm font-medium text-bronze">
            Simulateur
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Combien de CA dormant votre boutique pourrait-elle récupérer ?
          </h2>
        </div>

        <div className={`mt-16 grid gap-10 border p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14 ${t.border} ${t.card}`}>
          <div className="flex flex-col justify-center gap-8">
            <div>
              <label
                htmlFor="commandes"
                className="flex items-center justify-between text-sm font-medium"
              >
                <span>Commandes par mois</span>
                <span className="text-bronze">{commandes}</span>
              </label>
              <input
                id="commandes"
                type="range"
                min={50}
                max={1000}
                step={10}
                value={commandes}
                onChange={(e) => setCommandes(Number(e.target.value))}
                className="mt-3 w-full accent-bronze"
              />
            </div>

            <div>
              <label htmlFor="panierMoyen" className="text-sm font-medium">
                Panier moyen
              </label>
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="panierMoyen"
                  type="number"
                  min={10}
                  max={500}
                  step={5}
                  value={panierMoyen}
                  onChange={(e) => setPanierMoyen(Number(e.target.value) || 0)}
                  className={`w-28 rounded-[3px] border px-3 py-2 text-base ${t.border} ${t.bg}`}
                />
                <span className={t.textSoft}>€</span>
              </div>
            </div>

            <div className={`border p-5 ${t.border}`}>
              <p className={`text-sm ${t.textSoft}`}>
                Paniers abandonnés estimés / mois
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {Math.round(paniersAbandonnes)}
              </p>
              <p className={`mt-4 text-sm ${t.textSoft}`}>
                CA actuellement perdu / mois
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {currencyFormatter.format(caPerdu)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-10">
            <div className={`h-px w-full max-w-xs ${t.line}`}>
              <motion.div
                className="h-px bg-bronze"
                style={{ scaleX: gaugeScaleX, transformOrigin: "left" }}
              />
            </div>
            <div className="text-center">
              <p className={`text-sm ${t.textSoft}`}>CA récupérable estimé / mois</p>
              <motion.p
                key={Math.round(caRecuperable)}
                style={{ scale: shouldReduceMotion ? 1 : numberScale }}
                initial={shouldReduceMotion ? false : { opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="mt-1 font-display text-4xl font-semibold text-bronze sm:text-5xl"
              >
                {currencyFormatter.format(caRecuperable)}
              </motion.p>
            </div>
          </div>
        </div>

        <p className={`mx-auto mt-6 max-w-2xl text-center text-sm ${t.textSoft}`}>
          Estimation indicative basée sur des moyennes du secteur. Le chiffre
          réel est mesuré précisément après installation via un test à
          groupe témoin.
        </p>

        <div className="mt-8 text-center">
          <CtaButton href="#contact" tone={tone}>Recevoir mon audit gratuit</CtaButton>
        </div>
      </div>
    </section>
  );
}
