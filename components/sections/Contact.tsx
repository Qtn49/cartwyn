"use client";

import { useState, type FormEvent } from "react";
import FadeIn from "@/components/FadeIn";
import { DELAI_REPONSE } from "@/lib/contact";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

// Compte Formspree gratuit à créer sur https://formspree.io, puis coller
// l'ID du formulaire dans NEXT_PUBLIC_FORMSPREE_ENDPOINT (.env.local ou
// variables d'environnement de l'hébergement) — ex.
// NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

type Status = "idle" | "loading" | "success" | "error";

type ContactProps = {
  variant?: SectionVariant;
};

export default function Contact({ variant = "light" }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const t = sectionTokens[variant];

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
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
        <FadeIn className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
            Contact
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Recevez votre audit gratuit
          </h2>
          <p className={`mx-auto mt-4 max-w-xl ${t.textSoft}`}>
            Décrivez votre boutique en quelques champs, l&apos;équipe Cartwyn
            revient vers vous personnellement sous {DELAI_REPONSE}.
          </p>
        </FadeIn>

        {status === "success" ? (
          <FadeIn delay={0.1} className="mt-12 rounded-2xl border border-terracotta/30 bg-terracotta/10 p-8 text-center">
            <p className="font-display text-xl font-semibold text-terracotta">
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
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
                />
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
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
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
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
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
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
                >
                  <option value="" disabled>
                    Choisir…
                  </option>
                  <option value="shopify">Shopify</option>
                  <option value="prestashop">PrestaShop</option>
                  <option value="autre">Autre</option>
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
                  className="mt-2 w-full rounded-lg border border-brun/20 bg-creme-soft px-4 py-3 text-brun"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-full bg-terracotta px-7 py-3.5 text-base font-medium text-creme transition-colors hover:bg-terracotta-dark disabled:opacity-60 sm:w-auto"
                >
                  {status === "loading" ? "Envoi en cours…" : "Recevoir mon audit"}
                </button>
                {status === "error" && (
                  <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
                )}
              </div>
            </form>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
