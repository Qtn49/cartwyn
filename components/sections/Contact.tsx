"use client";

import { useState, type FormEvent } from "react";
import FadeIn from "@/components/FadeIn";
import CtaButton from "@/components/CtaButton";
import { DELAI_REPONSE } from "@/lib/contact";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

// Compte Formspree gratuit à créer sur https://formspree.io, puis coller
// l'ID du formulaire dans NEXT_PUBLIC_FORMSPREE_ENDPOINT (.env.production ou
// variables d'environnement du serveur Docker) — ex.
// NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

type Status = "idle" | "loading" | "success" | "error";

type ContactProps = {
  tone?: SectionTone;
};

export default function Contact({ tone = "ink" }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const t = sectionTokens[tone];
  const inputClass = `mt-2 w-full rounded-[3px] border px-4 py-3 ${t.border} bg-transparent ${t.text}`;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!FORMSPREE_ENDPOINT) {
      setStatus("error");
      setErrorMessage(
        "Le formulaire n'est pas encore configuré (NEXT_PUBLIC_FORMSPREE_ENDPOINT manquant)."
      );
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error("L'envoi a échoué.");
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "L'envoi a échoué."
      );
    }
  }

  return (
    <section id="contact" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn className="text-center">
          <p className="label text-sm font-medium text-bronze">
            Contact
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Recevez votre audit gratuit
          </h2>
          <p className={`mx-auto mt-4 max-w-xl ${t.textSoft}`}>
            Décrivez votre boutique en quelques champs, l&apos;équipe Cartwyn
            revient vers vous personnellement sous {DELAI_REPONSE}.
          </p>
        </FadeIn>

        {status === "success" ? (
          <FadeIn delay={0.1} className="mt-12 rounded-[3px] border border-bronze/40 bg-bronze/5 p-8 text-center">
            <p className="font-display text-xl font-semibold text-bronze">
              Merci.
            </p>
            <p className={`mt-2 leading-relaxed ${t.textSoft}`}>
              Je vous contacte personnellement sous {DELAI_REPONSE} pour vous
              présenter votre audit.
            </p>
          </FadeIn>
        ) : (
          <FadeIn delay={0.15}>
            <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="nom" className="text-sm font-medium">
                  Nom
                </label>
                <input id="nom" name="nom" type="text" required className={inputClass} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input id="email" name="email" type="email" required className={inputClass} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="telephone" className="text-sm font-medium">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="boutiqueUrl" className="text-sm font-medium">
                  URL de la boutique
                </label>
                <input
                  id="boutiqueUrl"
                  name="boutiqueUrl"
                  type="text"
                  required
                  placeholder="https://maboutique.fr"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="plateforme" className="text-sm font-medium">
                  Plateforme
                </label>
                <select
                  id="plateforme"
                  name="plateforme"
                  required
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="" disabled className="bg-ink">
                    Choisir…
                  </option>
                  <option value="shopify" className="bg-ink">Shopify</option>
                  <option value="prestashop" className="bg-ink">PrestaShop</option>
                  <option value="autre" className="bg-ink">Autre</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="commandesMensuelles" className="text-sm font-medium">
                  Commandes/mois (environ)
                </label>
                <input
                  id="commandesMensuelles"
                  name="commandesMensuelles"
                  type="text"
                  required
                  placeholder="ex. 300"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <CtaButton type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
                  {status === "loading" ? "Envoi en cours…" : "Recevoir mon audit"}
                </CtaButton>
                {status === "error" && (
                  <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
                )}
              </div>
            </form>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
