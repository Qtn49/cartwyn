import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Douleur from "@/components/sections/Douleur";
import ChiffresCles from "@/components/sections/ChiffresCles";
import Simulateur from "@/components/sections/Simulateur";
import Expertise from "@/components/sections/Expertise";
import PrixBrut from "@/components/sections/PrixBrut";
import CeQuiEstInclus from "@/components/sections/CeQuiEstInclus";
import Tarifs from "@/components/sections/Tarifs";
import Methode from "@/components/sections/Methode";
import CommentCaMarche from "@/components/sections/CommentCaMarche";
import APropos from "@/components/sections/APropos";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import { siteUrl } from "@/lib/site";
import { founderName, founderBio } from "@/lib/founder";

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
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
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

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Relance automatique de paniers abandonnés",
  provider: { "@type": "Organization", name: "Cartwyn", url: siteUrl },
  areaServed: "FR",
  audience: {
    "@type": "Audience",
    audienceType: "E-commerçants Shopify et PrestaShop",
  },
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
