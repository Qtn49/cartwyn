import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CtaButton from "@/components/CtaButton";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas ou plus.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-32 text-center sm:px-8">
        <p className="label text-sm font-medium text-bronze">Erreur 404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          Cette page n&apos;existe pas.
        </h1>
        <p className="mt-4 max-w-md text-ink/65">
          Le lien est peut-être obsolète, ou l&apos;adresse a été mal saisie.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <CtaButton href="/">Retour à l&apos;accueil</CtaButton>
          <Link
            href="/#contact"
            className="text-sm font-medium text-bronze underline underline-offset-4 hover:text-ink transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
