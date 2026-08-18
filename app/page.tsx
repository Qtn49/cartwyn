import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Constat from "@/components/sections/Constat";
import CommentCaMarche from "@/components/sections/CommentCaMarche";
import Simulateur from "@/components/sections/Simulateur";
import StackValeur from "@/components/sections/StackValeur";
import Methode from "@/components/sections/Methode";
import Tarifs from "@/components/sections/Tarifs";
import APropos from "@/components/sections/APropos";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero variant="light" />
        <Constat variant="light" />
        <CommentCaMarche variant="dark" />
        <Simulateur variant="light" />
        <StackValeur variant="light" />
        <Methode variant="light" />
        <Tarifs variant="dark" />
        <APropos variant="light" />
        <FAQ variant="light" />
        <Contact variant="light" />
      </main>
      <Footer />
    </>
  );
}
