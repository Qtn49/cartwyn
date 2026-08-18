import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pricing } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente du service Cartwyn.",
};

export default function CGV() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Conditions générales de vente
        </h1>
        <p className="mt-4 text-sm text-brun-soft">
          Dernière mise à jour : [date à compléter]
        </p>

        <div className="mt-10 space-y-8 text-brun-soft leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 1 — Objet
            </h2>
            <p className="mt-2">
              Les présentes conditions générales de vente régissent la
              prestation de service Cartwyn : installation et gestion d&apos;un
              système de relance automatique des paniers abandonnés pour
              boutiques Shopify et PrestaShop, incluant qualification du frein
              d&apos;achat et reporting mensuel du chiffre d&apos;affaires
              récupéré.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 2 — Prix
            </h2>
            <p className="mt-2">
              L&apos;installation est {pricing.installation.display.toLowerCase()}.
              L&apos;abonnement mensuel est de {pricing.abonnement.display}.
              {" "}
              {pricing.abonnement.detail}. Les montants sont exprimés hors
              taxes le cas échéant, selon le statut juridique du prestataire
              [à préciser].
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 3 — Modalités de paiement
            </h2>
            {/* À compléter : moyen de paiement, périodicité de facturation,
                pénalités de retard éventuelles. */}
            <p className="mt-2">
              [Modalités de paiement à compléter : moyen de paiement accepté,
              date de prélèvement, pénalités de retard.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 4 — Garantie
            </h2>
            <p className="mt-2">
              En cas de résultat insuffisant, Cartwyn s&apos;engage à
              poursuivre l&apos;ajustement des relances et de la qualification
              du frein d&apos;achat jusqu&apos;à l&apos;obtention d&apos;un
              résultat mesurable, plutôt que de procéder à un remboursement
              immédiat sans intervention corrective.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 5 — Résiliation
            </h2>
            {/* À compléter : préavis, modalités de résiliation. */}
            <p className="mt-2">
              [Conditions de résiliation à compléter : préavis, procédure,
              conséquences sur les données du client.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 6 — Responsabilité
            </h2>
            <p className="mt-2">
              Le CA récupéré affiché en cours d&apos;utilisation du
              simulateur est une estimation indicative basée sur des moyennes
              de marché. Seul le chiffre mesuré après installation, via la
              méthode à groupe témoin décrite sur le site, fait foi
              contractuellement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brun">
              Article 7 — Droit applicable
            </h2>
            <p className="mt-2">
              Les présentes CGV sont soumises au droit français. Tout litige
              relève, à défaut de résolution amiable, des tribunaux compétents
              [ressort à compléter].
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
