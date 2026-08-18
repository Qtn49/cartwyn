import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Cartwyn.",
};

export default function MentionsLegales() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Mentions légales
        </h1>

        <div className="mt-10 space-y-8 text-brun-soft leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Éditeur du site
            </h2>
            {/* À compléter par le porteur du projet : statut juridique
                (auto-entrepreneur / EI / société), dénomination, SIREN,
                adresse du siège, capital social le cas échéant. */}
            <p className="mt-2">
              Raison sociale / nom : [à compléter]
              <br />
              Statut juridique : [auto-entrepreneur / EI / société — à compléter]
              <br />
              SIREN : [à compléter]
              <br />
              Adresse : [à compléter]
              <br />
              Email de contact : [à compléter]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Directeur de la publication
            </h2>
            {/* À compléter : nom de la personne responsable de la publication. */}
            <p className="mt-2">[à compléter]</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Hébergement
            </h2>
            {/* À compléter avec l'hébergeur retenu (ex. Vercel Inc.),
                sa raison sociale et son adresse. */}
            <p className="mt-2">
              Hébergeur : [à compléter — ex. Vercel Inc.]
              <br />
              Adresse : [à compléter]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Propriété intellectuelle
            </h2>
            <p className="mt-2">
              L&apos;ensemble des contenus présents sur ce site (textes,
              illustrations, logo) est la propriété de Cartwyn, sauf mention
              contraire. Toute reproduction sans autorisation préalable est
              interdite.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Contact
            </h2>
            {/* À compléter : adresse email de réception dédiée. */}
            <p className="mt-2">
              Pour toute question relative à ces mentions légales : [email à
              compléter]
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
