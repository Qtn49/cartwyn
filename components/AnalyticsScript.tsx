"use client";

import Script from "next/script";
import { useConsent } from "@/lib/useConsent";

// Analytics privacy-friendly (Plausible) : pas de cookies, pas de données
// personnelles collectées — cohérent avec le positionnement RGPD de la
// marque, pas besoin d'un consentement séparé de celui du bandeau cookies.
// Créer un compte gratuit sur https://plausible.io, y ajouter le domaine
// cartwyn.fr, puis renseigner NEXT_PUBLIC_ANALYTICS_DOMAIN dans les
// variables d'environnement (.env.production ou config du serveur Docker).
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;

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
        src="https://plausible.io/js/script.js"
      />
    </>
  );
}
