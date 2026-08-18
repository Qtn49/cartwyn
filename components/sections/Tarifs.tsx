import FadeIn from "@/components/FadeIn";
import PlacesIndicator from "@/components/PlacesIndicator";
import { pricing, placesDisponibles } from "@/lib/pricing";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

type TarifsProps = {
  variant?: SectionVariant;
};

export default function Tarifs({ variant = "dark" }: TarifsProps) {
  const t = sectionTokens[variant];
  const cardBorder = variant === "dark" ? "border-creme/15" : "border-brun/10";
  const cardBg = variant === "dark" ? "bg-brun-soft/20" : "bg-creme";

  return (
    <section id="tarifs" className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
        <FadeIn className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
            Tarifs
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Une seule offre, pensée pour durer.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className={`mt-12 overflow-hidden rounded-3xl border ${cardBorder} ${cardBg}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${cardBorder}`}>
                <th className={`px-6 py-4 text-sm font-medium sm:px-8 ${t.textSoft}`}>
                  &nbsp;
                </th>
                <th className="px-6 py-4 font-display text-xl font-semibold sm:px-8">
                  Cartwyn
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${cardBorder}`}>
                <td className={`px-6 py-5 sm:px-8 ${t.textSoft}`}>
                  {pricing.installation.label}
                </td>
                <td className="px-6 py-5 font-display text-lg font-semibold text-terracotta sm:px-8">
                  {pricing.installation.display}
                </td>
              </tr>
              <tr className={`border-b ${cardBorder}`}>
                <td className={`px-6 py-5 sm:px-8 ${t.textSoft}`}>
                  {pricing.abonnement.label}
                </td>
                <td className="px-6 py-5 sm:px-8">
                  <p className="font-display text-lg font-semibold text-terracotta">
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
                      variant={variant}
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

        <FadeIn delay={0.2} className={`mt-8 rounded-2xl border p-6 ${cardBorder} ${cardBg}`}>
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
