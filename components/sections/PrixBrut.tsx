import { priceFrom } from "@/lib/pricing";
import { sectionTokens, type SectionTone } from "@/components/section-variant";

type PrixBrutProps = {
  tone?: SectionTone;
};

// Pré-qualifie le visiteur tout de suite, avant le détail de ce qui est
// inclus — évite l'effet "il faut contacter pour connaître le prix".
export default function PrixBrut({ tone = "creme" }: PrixBrutProps) {
  const t = sectionTokens[tone];

  return (
    <section className={`${t.bg} ${t.text}`}>
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <p className="label text-sm font-medium text-bronze">Prix</p>
        <p className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
          À partir de {priceFrom}€/mois
        </p>
        <p className={`mt-3 text-sm ${t.textSoft}`}>
          Le premier mois, vous ne payez que ce qu&apos;on vous a fait gagner.
          Le prix dépend ensuite de votre volume de commandes mensuel.
        </p>
        <a
          href="#tarifs"
          className="mt-6 inline-block text-sm font-medium text-bronze underline underline-offset-4 transition-colors hover:text-ink"
        >
          Voir la grille complète →
        </a>
      </div>
    </section>
  );
}
