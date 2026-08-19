// Source unique de vérité pour tous les montants affichés sur le site.
// Ne jamais coder un prix en dur ailleurs : importer depuis ce fichier.

export const pricing = {
  installation: {
    label: "Installation",
    amount: 0,
    display: "Offerte",
    detail: "0€ — aucun frais de mise en place, sur tous les paliers",
  },
  premierMois: {
    label: "1er mois",
    display: "Commission sur CA récupéré uniquement",
    detail:
      "Pas d'abonnement fixe facturé le premier mois : uniquement une commission sur le CA attribué via liens trackés, plafonnée au tarif standard du palier, sur tous les paliers.",
  },
} as const;

// Grille tarifaire par palier de volume de commandes mensuel. Un seul tarif
// par palier — l'argument commercial pour les premiers clients est le
// mécanisme du mois 1 plafonné (voir month1Offer), pas une remise de prix.
// prioritySlotsTaken à mettre à jour manuellement au fil des ventes.
export const pricingTiers = [
  {
    id: "essentiel",
    name: "Essentiel",
    ordersRange: "100-300 commandes/mois",
    price: 300,
    prioritySlotsTotal: 3,
    prioritySlotsTaken: 0,
  },
  {
    id: "croissance",
    name: "Croissance",
    ordersRange: "300-700 commandes/mois",
    price: 600,
    prioritySlotsTotal: 3,
    prioritySlotsTaken: 0,
  },
  {
    id: "volume",
    name: "Volume",
    ordersRange: "700-1000+ commandes/mois",
    price: 1200,
    prioritySlotsTotal: 3,
    prioritySlotsTaken: 0,
  },
] as const;

// Le mécanisme central proposé aux premiers clients : pas de remise sur le
// tarif affiché, mais une facturation du premier mois plafonnée au tarif
// standard du palier et indexée sur le CA réellement récupéré.
export const month1Offer = {
  headline:
    "Le premier mois, vous ne payez que ce qu'on vous a fait gagner.",
  description:
    "Aucun abonnement facturé le premier mois : uniquement une commission sur le CA que Cartwyn vous a fait récupérer, plafonnée au tarif standard de votre palier. Vous ne payez donc jamais plus cher qu'un abonnement classique dès le premier mois — et souvent moins.",
} as const;

// Tarif le plus bas de la grille, pour l'accroche "À partir de".
export const priceFrom = Math.min(...pricingTiers.map((tier) => tier.price));

// Paramètres du simulateur de CA récupérable — voir section "Méthode de calcul".
export const simulateur = {
  tauxAbandon: 0.7, // 70% des paniers en ligne sont abandonnés (source Baymard Institute)
  tauxRecuperation: 0.1, // taux conservateur, milieu bas de la fourchette 5–15% (source Klaviyo)
} as const;
