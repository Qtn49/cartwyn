import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique pour hébergement mutualisé (Hostinger) sans Node.js —
  // le build produit le dossier out/ à uploader tel quel.
  output: "export",
};

export default nextConfig;
