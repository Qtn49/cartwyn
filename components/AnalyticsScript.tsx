"use client";

import Script from "next/script";
import { useConsent } from "@/lib/useConsent";

// Analytics privacy-friendly (Plausible) : pas de cookies, pas de données
// personnelles collectées — cohérent avec le positionnement RGPD de la
// marque, pas besoin d'un consentement séparé de celui du bandeau cookies.
// NEXT_PUBLIC_ANALYTICS_DOMAIN : domaine suivi (cartwyn.fr).
// NEXT_PUBLIC_PLAUSIBLE_HOST : origine de l'instance Plausible (cloud
// https://plausible.io par défaut, ou https://analytics.cartwyn.fr pour
// l'instance auto-hébergée) — change aussi l'endpoint d'envoi des
// événements, qui suit toujours l'origine du script.
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
const PLAUSIBLE_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";

export default function AnalyticsScript() {
  const consent = useConsent();

  if (!ANALYTICS_DOMAIN || !consent.analytics) return null;

  return (
    <>
      {/* File d'attente officielle Plausible : les événements déclenchés
          avant le chargement complet du script ne sont pas perdus. */}
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
      <Script
        strategy="afterInteractive"
        data-domain={ANALYTICS_DOMAIN}
        src={`${PLAUSIBLE_HOST}/js/script.js`}
      />
    </>
  );
}
