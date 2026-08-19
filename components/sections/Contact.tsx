"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CtaButton from "@/components/CtaButton";
import { DELAI_REPONSE } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
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

const plateformes = [
  { value: "shopify", label: "Shopify" },
  { value: "prestashop", label: "PrestaShop" },
] as const;

export default function Contact({ tone = "creme" }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [plateforme, setPlateforme] = useState<(typeof plateformes)[number]["value"]>("shopify");
  const [consentRgpd, setConsentRgpd] = useState(false);
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
      trackEvent("Formulaire soumis");
      form.reset();
      setConsentRgpd(false);
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
                <span className="text-sm font-medium">Plateforme</span>
                <div className={`mt-2 inline-flex w-full overflow-hidden rounded-[3px] border ${t.border}`}>
                  {plateformes.map((p, i) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPlateforme(p.value)}
                      aria-pressed={plateforme === p.value}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        i > 0 ? `border-l ${t.border}` : ""
                      } ${plateforme === p.value ? "bg-bronze/15 text-bronze" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="plateforme" value={plateforme} />
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
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="consentRgpd"
                    checked={consentRgpd}
                    onChange={(e) => setConsentRgpd(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-bronze"
                  />
                  <span className={t.textSoft}>
                    J&apos;accepte que Cartwyn utilise ces informations pour me
                    recontacter au sujet de mon audit gratuit, conformément à
                    la{" "}
                    <Link
                      href="/politique-de-confidentialite"
                      className="text-bronze underline underline-offset-4 hover:text-ink transition-colors"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <CtaButton
                  type="submit"
                  tone={tone}
                  disabled={status === "loading" || !consentRgpd}
                  className="w-full sm:w-auto"
                >
                  {status === "loading" ? "Envoi en cours…" : "Recevoir mon audit"}
                </CtaButton>
                {status === "error" && (
                  <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            </form>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
