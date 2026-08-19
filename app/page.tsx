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

export default function Home() {
  return (
    <>
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
