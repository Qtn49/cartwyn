import type { NextConfig } from "next";

// CSP statique (pas de nonce par requête) : un nonce nécessiterait de lire
// headers() dans le layout racine, ce qui bascule tout le site en rendu
// dynamique et fait perdre le prerendering statique — testé, écarté pour un
// site à 4 pages sans donnée sensible par requête. script-src garde
// 'unsafe-inline' : testé aussi avec un hash SHA-256 pour le seul script
// inline propre au site (file d'attente Plausible), mais Next.js injecte
// lui-même plusieurs scripts inline pour l'hydratation (payload RSC), au
// contenu variable donc impossible à pré-hasher — les bloquer casse
// entièrement l'hydratation React (page blanche). Risque réel limité ici :
// aucun dangerouslySetInnerHTML sur de la donnée utilisateur dans tout le
// site (uniquement du JSON-LD généré depuis des constantes internes).
const PLAUSIBLE_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://formspree.io;
  frame-ancestors 'self';
  connect-src 'self' ${PLAUSIBLE_HOST} https://formspree.io;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Déploiement sur serveur Docker dédié — le build produit .next/standalone,
  // copié tel quel dans l'image finale (voir Dockerfile).
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
