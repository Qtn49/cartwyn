import FadeIn from "@/components/FadeIn";
import PlacesIndicator from "@/components/PlacesIndicator";
import { pricing, pricingTiers, month1Offer } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type TarifsProps = {
  tone?: SectionTone;
};

export default function Tarifs({ tone = "creme" }: TarifsProps) {
  const t = sectionTokens[tone];

  return (
    <section id="tarifs" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn className="text-center">
          <p className="label text-sm font-medium text-bronze">
            Offre actuelle
          </p>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Un tarif par palier, clair dès le départ.
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-sm ${t.textSoft}`}>
            {pricing.installation.detail}. {pricing.premierMois.detail}
          </p>
        </FadeIn>

        <FadeIn
          delay={0.1}
          className={`mx-auto mt-10 max-w-2xl rounded-[3px] border p-6 text-center ${t.border} ${t.card}`}
        >
          <p className="font-display text-lg font-semibold text-bronze">
            {month1Offer.headline}
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
            {month1Offer.description}
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => {
            const restantes = tier.prioritySlotsTotal - tier.prioritySlotsTaken;
            return (
              <FadeIn
                key={tier.id}
                delay={i * 0.08}
                className={`flex flex-col rounded-[3px] border p-8 ${t.border} ${t.card}`}
              >
                <p className="label text-xs font-medium text-bronze">
                  {tier.name}
                </p>
                <p className={`mt-1 text-sm ${t.textSoft}`}>{tier.ordersRange}</p>

                <p className="mt-6 font-display text-4xl font-semibold text-bronze">
                  {tier.price}€
                  <span className="text-lg font-normal">/mois</span>
                </p>
                <p className={`mt-1 text-xs ${t.textSoft}`}>
                  1er mois : commission plafonnée à {tier.price}€
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PlacesIndicator
                    total={tier.prioritySlotsTotal}
                    restantes={restantes}
                    tone={tone}
                  />
                  <span className="text-sm">
                    {restantes}/{tier.prioritySlotsTotal} places d&apos;intégration prioritaire
                  </span>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={0.3}>
          <p className={`mt-6 text-sm ${t.textSoft}`}>
            Ce nombre de places reflète une capacité d&apos;accompagnement
            réelle — chaque installation est suivie personnellement — et
            n&apos;est jamais un tarif préférentiel ou une remise marketing.
          </p>
        </FadeIn>

        <FadeIn delay={0.35} className={`mt-8 rounded-[3px] border p-6 ${t.border}`}>
          <p className="font-display text-lg font-semibold">
            Garantie de résultat, pas de remboursement sec
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
            Si le CA récupéré n&apos;est pas au rendez-vous, nous continuons à
            ajuster les relances et la qualification avec vous jusqu&apos;à
            obtenir un résultat mesurable — plutôt que de vous rembourser et
            de nous arrêter là.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
