"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import Panier from "@/components/illustrations/Panier";
import { simulateur } from "@/lib/pricing";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

const FILL_REFERENCE_CA = 8000; // CA récupérable au-delà duquel le panier est affiché plein

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

type SimulateurProps = {
  variant?: SectionVariant;
};

export default function Simulateur({ variant = "light" }: SimulateurProps) {
  const [commandes, setCommandes] = useState(300);
  const [panierMoyen, setPanierMoyen] = useState(65);
  const shouldReduceMotion = useReducedMotion();
  const fill = useMotionValue(0);
  const t = sectionTokens[variant];

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
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
            Simulateur
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Combien de CA dormant votre boutique pourrait-elle récupérer ?
          </h2>
        </div>

        <div className="mt-14 grid gap-10 rounded-3xl bg-creme-soft p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div className="flex flex-col justify-center gap-8">
            <div>
              <label
                htmlFor="commandes"
                className="flex items-center justify-between text-sm font-medium"
              >
                <span>Commandes par mois</span>
                <span className="text-terracotta">{commandes}</span>
              </label>
              <input
                id="commandes"
                type="range"
                min={50}
                max={1000}
                step={10}
                value={commandes}
                onChange={(e) => setCommandes(Number(e.target.value))}
                className="mt-3 w-full accent-terracotta"
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
                  className="w-28 rounded-lg border border-brun/20 bg-creme px-3 py-2 text-base"
                />
                <span className="text-brun-soft">€</span>
              </div>
            </div>

            <div className="rounded-2xl border border-brun/10 bg-creme p-5">
              <p className="text-sm text-brun-soft">
                Paniers abandonnés estimés / mois
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {Math.round(paniersAbandonnes)}
              </p>
              <p className="mt-4 text-sm text-brun-soft">
                CA actuellement perdu / mois
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {currencyFormatter.format(caPerdu)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <Panier fill={fill} className="h-auto w-full max-w-xs" variant={variant} />
            <div className="text-center">
              <p className="text-sm text-brun-soft">CA récupérable estimé / mois</p>
              <motion.p
                key={Math.round(caRecuperable)}
                initial={shouldReduceMotion ? false : { opacity: 0.5, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-1 font-display text-4xl font-semibold text-terracotta sm:text-5xl"
              >
                {currencyFormatter.format(caRecuperable)}
              </motion.p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-brun-soft">
          Estimation indicative basée sur des moyennes du secteur. Le chiffre
          réel est mesuré précisément après installation via un test à
          groupe témoin.
        </p>

        <div className="mt-8 text-center">
          <a
            href="#contact"
            className="inline-block rounded-full bg-terracotta px-7 py-3.5 text-base font-medium text-creme transition-colors hover:bg-terracotta-dark"
          >
            Recevoir mon audit gratuit
          </a>
        </div>
      </div>
    </section>
  );
}
