// URL canonique du site — source unique pour le sitemap, robots.txt, les
// métadonnées et le balisage JSON-LD. Ne jamais coder cette valeur en dur
// ailleurs.
export const siteUrl = "https://cartwyn.fr";

// Fil d'ariane réel (Accueil -> page) pour le JSON-LD BreadcrumbList des
// pages légales — reflète juste la navigation existante, rien d'inventé.
export function breadcrumbJsonLd(pageName: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: `${siteUrl}${path}`,
      },
    ],
  };
}
