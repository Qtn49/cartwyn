import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pricing, pricingTiers, month1Offer } from "@/lib/pricing";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente du service Cartwyn.",
  alternates: {
    canonical: `${siteUrl}/cgv`,
  },
};

export default function CGV() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Conditions générales de vente
        </h1>
        <p className="mt-4 text-sm text-ink/65">
          Dernière mise à jour : 20 août 2026
        </p>

        <div className="mt-10 space-y-8 text-ink/65 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 1 — Objet
            </h2>
            <p className="mt-2">
              Les présentes conditions générales de vente régissent la
              prestation de service Cartwyn, fournie par Quentin Guez
              (entrepreneur individuel, SIREN 899 504 344) : gestion de
              campagnes de relance de paniers abandonnés pour sites
              e-commerce Shopify et PrestaShop, incluant qualification du
              frein d&apos;achat et reporting mensuel du chiffre
              d&apos;affaires récupéré.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 2 — Prix
            </h2>
            <p className="mt-2">
              L&apos;installation est {pricing.installation.display.toLowerCase()}.
              L&apos;abonnement mensuel dépend du palier souscrit, selon le
              volume de commandes mensuel de la boutique :{" "}
              {pricingTiers
                .map(
                  (tier) =>
                    `${tier.name} (${tier.ordersRange}) — ${tier.price}€/mois`
                )
                .join(" ; ")}
              . {month1Offer.description} Les montants sont exprimés hors
              taxes : TVA non applicable, article 293 B du Code général des
              impôts (franchise en base de TVA).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 3 — Modalités de paiement
            </h2>
            {/* moyen de paiement à définir avant les premières facturations
                réelles (virement, prélèvement SEPA, etc.) */}
            <p className="mt-2">
              Facturation mensuelle. Le moyen de paiement précis sera
              communiqué au client avant sa première facturation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 4 — Durée et résiliation
            </h2>
            <p className="mt-2">
              L&apos;abonnement est sans engagement de durée. Le client peut
              résilier à tout moment par email à contact@cartwyn.fr, la
              résiliation prenant effet à la fin du mois d&apos;abonnement en
              cours.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 5 — Obligations de Cartwyn
            </h2>
            <p className="mt-2">
              Cartwyn s&apos;engage à mettre en place et gérer le système de
              relance de paniers abandonnés du client, et à lui fournir un
              reporting mensuel du chiffre d&apos;affaires récupéré.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 6 — Obligations du client
            </h2>
            <p className="mt-2">
              Le client s&apos;engage à fournir à Cartwyn un accès valide à sa
              boutique (API/webhooks) et à garantir l&apos;exactitude des
              informations transmises.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 7 — Responsabilité
            </h2>
            <p className="mt-2">
              Cartwyn est tenu à une obligation de moyens : le montant du
              chiffre d&apos;affaires récupéré n&apos;est pas garanti. Le CA
              récupéré affiché dans le simulateur du site est une estimation
              indicative basée sur des moyennes de marché ; seul le chiffre
              mesuré après installation, via la méthode à groupe témoin
              décrite sur le site, fait foi contractuellement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 8 — Propriété intellectuelle
            </h2>
            <p className="mt-2">
              Cartwyn conserve la pleine propriété de sa technologie. Le
              client ne dispose que d&apos;un droit d&apos;usage du service
              pendant la durée de son abonnement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 9 — Confidentialité
            </h2>
            <p className="mt-2">
              Les données du client et de ses propres clients finaux,
              traitées par Cartwyn pour le compte du client, restent
              confidentielles et ne sont utilisées que pour l&apos;exécution
              du service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              Article 10 — Droit applicable et juridiction compétente
            </h2>
            <p className="mt-2">
              Les présentes CGV sont soumises au droit français. Tout litige
              relève, à défaut de résolution amiable, du tribunal judiciaire
              d&apos;Angers.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
