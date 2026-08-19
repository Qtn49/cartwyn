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

        <div className="mt-10 space-y-8 text-ink/65 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Éditeur du site
            </h2>
            <p className="mt-2">
              Éditeur : Quentin Guez, entrepreneur individuel (micro-entreprise)
              <br />
              SIREN : 899 504 344
              <br />
              Forme d&apos;activité : libérale (auteur de logiciels)
              <br />
              TVA : non applicable, article 293 B du Code général des impôts
              (franchise en base de TVA)
              <br />
              Adresse du siège de l&apos;activité : 46 rue du Pré Pigeon, 49100
              Angers
              <br />
              Email de contact : contact@cartwyn.fr
              <br />
              Téléphone : 06 48 59 24 88
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Directeur de la publication
            </h2>
            <p className="mt-2">Quentin Guez.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Hébergement
            </h2>
            {/* Coordonnées OVHcloud à revérifier sur ovhcloud.com avant
                publication — elles peuvent avoir changé. */}
            <p className="mt-2">
              Hébergeur : OVHcloud, SAS au capital de 10 174 560 €
              <br />
              RCS Lille Métropole 424 761 419 00045
              <br />
              Adresse : 2 rue Kellermann, 59100 Roubaix, France
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Propriété intellectuelle
            </h2>
            <p className="mt-2">
              L&apos;ensemble des contenus présents sur ce site (textes,
              charte graphique, code) est la propriété de Quentin Guez /
              Cartwyn, sauf mention contraire. Toute reproduction sans
              autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Contact
            </h2>
            <p className="mt-2">
              Pour toute question relative à ces mentions légales :
              contact@cartwyn.fr
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
