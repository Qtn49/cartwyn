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

// Schema.org Organization : utile pour la recherche de marque (nom, logo,
// URL dans les résultats Google), pas un balisage FAQPage — Google a
// supprimé les FAQ rich results en mai 2026, pas la peine d'y investir.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cartwyn",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
