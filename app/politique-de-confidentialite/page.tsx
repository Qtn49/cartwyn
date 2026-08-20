import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données du site Cartwyn.",
  alternates: {
    canonical: `${siteUrl}/politique-de-confidentialite`,
  },
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
          Dernière mise à jour : 20 août 2026
        </p>

        <div className="mt-10 space-y-8 text-ink/65 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Responsable du traitement
            </h2>
            <p className="mt-2">
              Quentin Guez (Cartwyn), contact@cartwyn.fr.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Données collectées
            </h2>
            <p className="mt-2">
              Via le formulaire de contact : nom, email, téléphone, URL de la
              boutique, plateforme e-commerce et volume approximatif de
              commandes mensuelles. Aucune autre donnée personnelle n&apos;est
              collectée par ailleurs. Le simulateur de CA récupérable ne
              transmet aucune donnée : les calculs sont effectués localement
              dans votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Finalité du traitement
            </h2>
            <p className="mt-2">
              Ces données sont utilisées pour traiter votre demande d&apos;audit
              gratuit et vous recontacter par téléphone ou par email à ce
              sujet.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Base légale
            </h2>
            <p className="mt-2">
              Le traitement repose sur votre consentement explicite, recueilli
              via la case à cocher dédiée du formulaire de contact, pour une
              utilisation de vos informations à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Destinataires
            </h2>
            <p className="mt-2">
              Les données transmises via le formulaire de contact transitent
              par Formspree (société américaine), qui assure la gestion de la
              boîte de réception du formulaire. Ce sous-traitant s&apos;appuie
              sur des clauses contractuelles types (CCT) pour encadrer le
              transfert de données hors Union européenne, conformément au
              RGPD. Aucun autre destinataire n&apos;a accès à ces données.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Durée de conservation
            </h2>
            <p className="mt-2">
              Les données sont conservées 3 ans à compter du dernier contact
              si aucune relation commerciale n&apos;est établie.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Analytics
            </h2>
            <p className="mt-2">
              Le site utilise Plausible, un outil de mesure d&apos;audience qui
              ne dépose pas de cookie de tracking individuel et ne collecte
              aucune donnée personnelle identifiante. Il n&apos;est activé
              qu&apos;après votre consentement via le bandeau de gestion des
              cookies, catégorie « Mesure d&apos;audience ».
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Cookies
            </h2>
            <p className="mt-2">
              Trois catégories de cookies existent sur ce site, toutes
              désactivées par défaut à l&apos;exception des essentiels :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink">Essentiels</strong> — nécessaires
                au fonctionnement du site (mémorisation de votre choix de
                consentement notamment), toujours actifs.
              </li>
              <li>
                <strong className="text-ink">Mesure d&apos;audience</strong> —
                statistiques anonymes de fréquentation via Plausible, déposés
                uniquement si vous les acceptez.
              </li>
              <li>
                <strong className="text-ink">Chat</strong> — permettent
                d&apos;afficher le widget de messagerie, déposés uniquement si
                vous les acceptez.
              </li>
            </ul>
            <p className="mt-2">
              Vous pouvez modifier votre choix à tout moment en effaçant les
              cookies de votre navigateur pour ce site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Vos droits
            </h2>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d&apos;un droit
              d&apos;accès, de rectification, d&apos;effacement,
              d&apos;opposition et de portabilité de vos données. Pour
              exercer ces droits, contactez-nous à contact@cartwyn.fr. Vous
              pouvez également introduire une réclamation auprès de la CNIL
              (cnil.fr).
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
