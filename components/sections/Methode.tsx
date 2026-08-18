import FadeIn from "@/components/FadeIn";
import { simulateur } from "@/lib/pricing";
import { sectionTokens, type SectionVariant } from "@/components/section-variant";

type MethodeProps = {
  variant?: SectionVariant;
};

export default function Methode({ variant = "light" }: MethodeProps) {
  const t = sectionTokens[variant];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-wide text-terracotta">
            Méthode de calcul
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Jamais de chiffre gonflé, une méthode publique.
          </h2>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-8">
          <p className="text-lg leading-relaxed text-brun-soft">
            Tant qu&apos;il n&apos;existe pas de client réel pour en témoigner,
            notre sérieux se prouve par la transparence de la méthode plutôt
            que par des témoignages. Voici comment le CA récupéré est mesuré.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <FadeIn delay={0.1} className="rounded-2xl border border-brun/10 bg-creme-soft p-6">
            <p className="font-display text-lg font-semibold">Groupe témoin</p>
            <p className="mt-2 text-sm leading-relaxed text-brun-soft">
              Une partie des paniers abandonnés n&apos;est volontairement pas
              relancée. Elle sert de référence pour mesurer ce qui se serait
              passé sans intervention.
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className="rounded-2xl border border-brun/10 bg-creme-soft p-6">
            <p className="font-display text-lg font-semibold">Groupe relancé</p>
            <p className="mt-2 text-sm leading-relaxed text-brun-soft">
              Le reste des paniers reçoit les relances Cartwyn. Le CA généré y
              est suivi via des liens trackés.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="mt-8 rounded-2xl bg-brun p-6 text-creme sm:p-8">
          <p className="font-display text-lg font-semibold">
            CA récupéré réel = CA du groupe relancé − CA du groupe témoin
          </p>
          <p className="mt-2 text-sm leading-relaxed text-creme/80">
            Seul cet écart net est communiqué comme « CA récupéré » dans votre
            rapport mensuel — jamais le total des relances envoyées.
          </p>
        </FadeIn>

        <FadeIn delay={0.25} className="mt-8 text-sm text-brun-soft">
          <p>
            Avant l&apos;installation, le simulateur de la page d&apos;accueil
            utilise des moyennes de marché : un taux d&apos;abandon de{" "}
            {Math.round(simulateur.tauxAbandon * 100)}% (source Baymard
            Institute) et un taux de récupération conservateur de{" "}
            {Math.round(simulateur.tauxRecuperation * 100)}% (milieu bas de la
            fourchette 5–15% observée, source Klaviyo). Ces moyennes sont
            remplacées par vos chiffres réels dès le premier mois.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
