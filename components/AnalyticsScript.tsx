"use client";

import Script from "next/script";
import { useConsent } from "@/lib/useConsent";

// Analytics privacy-friendly (Plausible) : pas de cookies, pas de données
// personnelles collectées — cohérent avec le positionnement RGPD de la
// marque, pas besoin d'un consentement séparé de celui du bandeau cookies.
// NEXT_PUBLIC_ANALYTICS_DOMAIN : domaine suivi (cartwyn.fr).
// NEXT_PUBLIC_PLAUSIBLE_HOST : origine de l'instance Plausible (cloud
// https://plausible.io par défaut, ou https://analytics.cartwyn.fr pour
// l'instance auto-hébergée).
// NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID : identifiant du script propre au site,
// fourni par le dashboard Plausible lors de l'ajout du site (ex.
// "pa-xxxxxxxxxxxxxxxxxxxxx") — encode déjà le domaine suivi, donc
// data-domain devient inutile avec ce mode. Si absent, on retombe sur
// l'ancien script générique /js/script.js + data-domain (utile pour le
// cloud Plausible, qui n'utilise pas ce mécanisme).
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
const PLAUSIBLE_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";
const PLAUSIBLE_SCRIPT_ID = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID;

export default function AnalyticsScript() {
  const consent = useConsent();

  if (!ANALYTICS_DOMAIN || !consent.analytics) return null;

  const scriptSrc = PLAUSIBLE_SCRIPT_ID
    ? `${PLAUSIBLE_HOST}/js/${PLAUSIBLE_SCRIPT_ID}.js`
    : `${PLAUSIBLE_HOST}/js/script.js`;

  return (
    <>
      {/* File d'attente officielle Plausible : les événements déclenchés
          avant le chargement complet du script ne sont pas perdus. */}
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
      <Script
        strategy="afterInteractive"
        src={scriptSrc}
        {...(!PLAUSIBLE_SCRIPT_ID && { "data-domain": ANALYTICS_DOMAIN })}
      />
    </>
  );
}
