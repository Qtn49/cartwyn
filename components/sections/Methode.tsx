import FadeIn from "@/components/FadeIn";
import { simulateur } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type MethodeProps = {
  tone?: SectionTone;
};

export default function Methode({ tone = "creme" }: MethodeProps) {
  const t = sectionTokens[tone];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-36">
        <FadeIn>
          <p className="label text-sm font-medium text-bronze">
            Méthode de calcul
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Jamais de chiffre gonflé, une méthode publique.
          </h2>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-8">
          <p className={`text-lg leading-relaxed ${t.textSoft}`}>
            Tant qu&apos;il n&apos;existe pas de client réel pour en témoigner,
            notre sérieux se prouve par la transparence de la méthode plutôt
            que par des témoignages. Voici comment le CA récupéré est mesuré.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <FadeIn delay={0.1} className={`rounded-[3px] border p-6 ${t.border}`}>
            <p className="font-display text-lg font-semibold">Groupe témoin</p>
            <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
              Une partie des paniers abandonnés n&apos;est volontairement pas
              relancée. Elle sert de référence pour mesurer ce qui se serait
              passé sans intervention.
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className={`rounded-[3px] border p-6 ${t.border}`}>
            <p className="font-display text-lg font-semibold">Groupe relancé</p>
            <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
              Le reste des paniers reçoit les relances Cartwyn. Le CA généré y
              est suivi via des liens trackés.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="mt-8 rounded-[3px] border border-bronze/40 bg-bronze/5 p-6 sm:p-8">
          <p className="font-display text-lg font-semibold">
            CA récupéré réel = CA du groupe relancé − CA du groupe témoin
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${t.textSoft}`}>
            Seul cet écart net est communiqué comme « CA récupéré » dans votre
            rapport mensuel — jamais le total des relances envoyées.
          </p>
        </FadeIn>

        <FadeIn delay={0.25} className={`mt-8 text-sm ${t.textSoft}`}>
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
