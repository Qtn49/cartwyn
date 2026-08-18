// Source unique de vérité pour tous les montants affichés sur le site.
// Ne jamais coder un prix en dur ailleurs : importer depuis ce fichier.

export const pricing = {
  installation: {
    label: "Installation",
    amount: 0,
    display: "Offerte",
    detail: "0€ — aucun frais de mise en place",
  },
  abonnement: {
    label: "Abonnement",
    amount: 200,
    currency: "EUR",
    period: "mois",
    display: "200€/mois",
    detail:
      "1er mois : commission uniquement sur le CA récupéré via liens trackés, pas d'abonnement fixe",
  },
  premierMois: {
    label: "1er mois",
    display: "Commission sur CA récupéré uniquement",
    detail: "Pas d'abonnement fixe facturé le premier mois.",
  },
} as const;

// Compteur de places pilotes : limite de capacité réelle liée à l'accompagnement
// personnalisé, jamais une remise marketing. À mettre à jour manuellement.
export const placesDisponibles = {
  total: 5,
  restantes: 3,
} as const;

// Paramètres du simulateur de CA récupérable — voir section "Méthode de calcul".
export const simulateur = {
  tauxAbandon: 0.7, // 70% des paniers en ligne sont abandonnés (source Baymard Institute)
  tauxRecuperation: 0.1, // taux conservateur, milieu bas de la fourchette 5–15% (source Klaviyo)
} as const;
