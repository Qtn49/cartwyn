import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Déploiement sur serveur Docker dédié — le build produit .next/standalone,
  // copié tel quel dans l'image finale (voir Dockerfile).
  output: "standalone",
};

export default nextConfig;
