import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brun/10 bg-creme text-brun">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">Cartwyn</p>
            <p className="mt-2 max-w-xs text-sm text-brun-soft">
              Relance automatique des paniers abandonnés, reporting mensuel
              du CA récupéré.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-brun-soft">Légal</p>
            <Link href="/mentions-legales" className="hover:text-terracotta transition-colors">
              Mentions légales
            </Link>
            <Link
              href="/politique-de-confidentialite"
              className="hover:text-terracotta transition-colors"
            >
              Politique de confidentialité
            </Link>
            <Link href="/cgv" className="hover:text-terracotta transition-colors">
              CGV
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-brun-soft">Réseaux</p>
            {/* Liens à compléter avec les vrais profils Cartwyn */}
            <a href="#" className="hover:text-terracotta transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-terracotta transition-colors">
              Instagram
            </a>
          </div>
        </div>

        <p className="mt-10 text-xs text-brun-soft">
          © {year} Cartwyn. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
