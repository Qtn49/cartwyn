import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données du site Cartwyn.",
};

export default function PolitiqueConfidentialite() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-ink/65">
          Dernière mise à jour : [date à compléter]
        </p>

        <div className="mt-10 space-y-8 text-ink/65 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Données collectées
            </h2>
            <p className="mt-2">
              Lorsque vous utilisez le formulaire de contact ou le simulateur
              de CA récupérable, nous collectons : votre nom, votre adresse
              email, l&apos;URL de votre boutique, votre plateforme
              e-commerce et le volume approximatif de commandes mensuelles.
              Le simulateur de CA lui-même ne transmet aucune donnée : les
              calculs sont effectués localement dans votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Finalité du traitement
            </h2>
            <p className="mt-2">
              Ces données sont utilisées exclusivement pour répondre à votre
              demande d&apos;audit gratuit et, si vous devenez client, pour la
              mise en place et le suivi du service Cartwyn.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Durée de conservation
            </h2>
            {/* À compléter précisément selon la politique interne retenue. */}
            <p className="mt-2">
              Les données des demandes non suivies d&apos;un client sont
              conservées [durée à compléter, ex. 3 ans] puis supprimées. Les
              données des clients sont conservées pendant la durée de la
              relation contractuelle, augmentée des obligations légales de
              conservation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Cookies
            </h2>
            <p className="mt-2">
              Seuls des cookies essentiels au fonctionnement du site sont
              déposés par défaut. Les cookies de mesure d&apos;audience et de
              chat ne sont déposés qu&apos;après votre consentement explicite,
              recueilli via le bandeau de gestion des cookies. Vous pouvez
              modifier votre choix à tout moment en effaçant les cookies de
              votre navigateur pour ce site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Hébergement et transfert de données
            </h2>
            {/* À compléter avec le nom exact de l'hébergeur retenu. */}
            <p className="mt-2">
              Les données sont hébergées en France/Union européenne, chez
              [hébergeur à compléter]. Aucun transfert hors UE n&apos;est
              effectué sans garanties appropriées.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Vos droits
            </h2>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d&apos;un droit
              d&apos;accès, de rectification, d&apos;effacement, de
              limitation et d&apos;opposition au traitement de vos données.
              Pour exercer ces droits, contactez-nous à : [email à compléter].
              Vous pouvez également introduire une réclamation auprès de la
              CNIL (www.cnil.fr).
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
