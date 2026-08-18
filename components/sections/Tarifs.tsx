import FadeIn from "@/components/FadeIn";
import PlacesIndicator from "@/components/PlacesIndicator";
import { pricing, placesDisponibles } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type TarifsProps = {
  tone?: SectionTone;
};

export default function Tarifs({ tone = "ink-soft" }: TarifsProps) {
  const t = sectionTokens[tone];

  return (
    <section id="tarifs" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn className="text-center">
          <p className="label text-sm font-medium text-bronze">
            Tarifs
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Une seule offre, pensée pour durer.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className={`mt-14 overflow-hidden rounded-[3px] border ${t.border}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${t.border}`}>
                <th className={`px-6 py-4 text-sm font-medium sm:px-8 ${t.textSoft}`}>
                  &nbsp;
                </th>
                <th className="px-6 py-4 font-display text-xl font-semibold sm:px-8">
                  Cartwyn
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${t.border}`}>
                <td className={`px-6 py-5 sm:px-8 ${t.textSoft}`}>
                  {pricing.installation.label}
                </td>
                <td className="px-6 py-5 font-display text-lg font-semibold text-bronze sm:px-8">
                  {pricing.installation.display}
                </td>
              </tr>
              <tr className={`border-b ${t.border}`}>
                <td className={`px-6 py-5 sm:px-8 ${t.textSoft}`}>
                  {pricing.abonnement.label}
                </td>
                <td className="px-6 py-5 sm:px-8">
                  <p className="font-display text-lg font-semibold text-bronze">
                    {pricing.abonnement.display}
                  </p>
                  <p className={`mt-1 text-sm ${t.textSoft}`}>
                    {pricing.abonnement.detail}
                  </p>
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-5 sm:px-8 ${t.textSoft}`}>
                  Places disponibles ce mois-ci
                </td>
                <td className="px-6 py-5 sm:px-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <PlacesIndicator
                      total={placesDisponibles.total}
                      restantes={placesDisponibles.restantes}
                      tone={tone}
                    />
                    <span className="font-display text-lg font-semibold">
                      {placesDisponibles.restantes}/{placesDisponibles.total} places
                      restantes
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className={`mt-6 text-sm ${t.textSoft}`}>
            Ce nombre de places reflète une capacité d&apos;accompagnement
            réelle — chaque installation est suivie personnellement — et
            n&apos;est jamais un tarif préférentiel ou une remise marketing.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className={`mt-8 rounded-[3px] border p-6 ${t.border}`}>
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
