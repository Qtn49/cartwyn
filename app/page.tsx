import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import { siteUrl } from "@/lib/site";
import { founderName, founderBio } from "@/lib/founder";
import { pricingTiers } from "@/lib/pricing";

// Code-splitting des sections sous la ligne de flottaison : chaque import()
// devient son propre chunk JS, chargé après le bundle initial. `ssr` reste
// à sa valeur par défaut (true) partout ci-dessous — jamais `ssr: false` —
// donc le texte de chaque section est toujours rendu côté serveur, présent
// dans le HTML brut avec ou sans JS. Seul le chargement du JS (animations,
// interactivité) est différé, pas le contenu. Hero reste en import statique
// : c'est la seule section garantie au-dessus de la ligne de flottaison.
const Douleur = dynamic(() => import("@/components/sections/Douleur"));
const ChiffresCles = dynamic(() => import("@/components/sections/ChiffresCles"));
const Simulateur = dynamic(() => import("@/components/sections/Simulateur"));
const Expertise = dynamic(() => import("@/components/sections/Expertise"));
const PrixBrut = dynamic(() => import("@/components/sections/PrixBrut"));
const CeQuiEstInclus = dynamic(() => import("@/components/sections/CeQuiEstInclus"));
const Tarifs = dynamic(() => import("@/components/sections/Tarifs"));
const Methode = dynamic(() => import("@/components/sections/Methode"));
const CommentCaMarche = dynamic(() => import("@/components/sections/CommentCaMarche"));
const APropos = dynamic(() => import("@/components/sections/APropos"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));
const Contact = dynamic(() => import("@/components/sections/Contact"));

// Schema.org Organization : utile pour la recherche de marque (nom, logo,
// URL dans les résultats Google), pas un balisage FAQPage — Google a
// supprimé les FAQ rich results en mai 2026, pas la peine d'y investir.
// `founder` référence le Person ci-dessous : signal d'autorité E-E-A-T,
// jamais affiché visuellement (CLAUDE.md, règle 2).
const founderJsonLd = {
  "@type": "Person",
  name: founderName,
  jobTitle: "Fondateur",
  description: founderBio,
};

// address/contactPoint reprennent tels quels les mentions légales
// (app/mentions-legales/page.tsx) — aucune donnée inventée. Pas de `sameAs` :
// Cartwyn n'a pas de profil public (LinkedIn/GitHub) à référencer pour
// l'instant, inventer un lien serait pire que ne rien mettre.
// @id stable pour que Service.provider référence cette même entité au lieu
// de répéter une Organization séparée (déduplication du graphe de données).
const organizationId = `${siteUrl}/#organization`;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: "Cartwyn",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  founder: founderJsonLd,
  address: {
    "@type": "PostalAddress",
    streetAddress: "46 rue du Pré Pigeon",
    postalCode: "49100",
    addressLocality: "Angers",
    addressCountry: "FR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@cartwyn.fr",
    telephone: "+33648592488",
    contactType: "customer service",
    areaServed: "FR",
    availableLanguage: "French",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cartwyn",
  url: siteUrl,
  inLanguage: "fr-FR",
};

// offers reprend tels quels les 3 paliers réels de lib/pricing.ts — aucun
// prix inventé, source unique de vérité inchangée.
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Relance automatique de paniers abandonnés",
  provider: { "@id": organizationId },
  areaServed: "FR",
  audience: {
    "@type": "Audience",
    audienceType: "E-commerçants Shopify et PrestaShop",
  },
  offers: pricingTiers.map((tier) => ({
    "@type": "Offer",
    name: `Palier ${tier.name}`,
    description: tier.ordersRange,
    price: tier.price,
    priceCurrency: "EUR",
    url: `${siteUrl}/#tarifs`,
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Header />
      <main>
        <Hero tone="creme" />
        <Douleur tone="creme" />
        <ChiffresCles tone="ink" />
        <Simulateur tone="creme-soft" />
        <Expertise tone="creme" />
        <PrixBrut tone="creme-soft" />
        <CeQuiEstInclus tone="creme" />
        <Tarifs tone="creme-soft" />
        <Methode tone="creme" />
        <APropos tone="creme-soft" />
        <CommentCaMarche tone="creme" />
        <FAQ tone="creme-soft" />
        <Contact tone="creme" />
      </main>
      <Footer />
    </>
  );
}
