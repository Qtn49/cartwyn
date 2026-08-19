"use client";

import { motion, useReducedMotion } from "framer-motion";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type DouleurProps = {
  tone?: SectionTone;
};

// Démonstration directe et personnelle plutôt que statistique générique —
// les chiffres sourcés arrivent juste après, dans la section Chiffres clés.
export default function Douleur({ tone = "creme" }: DouleurProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = sectionTokens[tone];

  return (
    <section id="constat" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 lg:py-40">
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="label text-sm font-medium text-bronze"
        >
          Le constat
        </motion.p>
        <motion.h2
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
        >
          Sur 100 visiteurs qui ajoutent un article au panier,{" "}
          <span className="text-bronze">70 repartent sans payer</span>.
        </motion.h2>
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className={`mx-auto mt-6 max-w-xl text-lg leading-relaxed ${t.textSoft}`}
        >
          Ce n&apos;est pas une hypothèse. C&apos;est ce qui se passe sur
          votre boutique en ce moment — pendant que vous lisez cette phrase.
        </motion.p>
      </div>
    </section>
  );
}
