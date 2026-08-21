// Chiffres cités sur le site — chaque statistique doit avoir une source réelle,
// affichée en petit texte sous le chiffre. Ne jamais inventer un chiffre.

export type Stat = {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  source: string;
};

export const stats: Stat[] = [
  {
    value: 70,
    suffix: "%",
    label: "des paniers en ligne sont abandonnés (jusqu'à 85% sur mobile)",
    source: "Baymard Institute, 2024",
  },
  {
    value: 2.82,
    prefix: "",
    suffix: "€",
    label:
      "de rendement moyen par email de relance envoyé (5 à 15% des paniers abandonnés récupérés en moyenne)",
    source: "Klaviyo, Benchmark e-commerce",
  },
  {
    value: 78,
    suffix: "%",
    label: "des clients concluent avec la première entreprise qui leur répond",
    source: "Harvard Business Review",
  },
];
