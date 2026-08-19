// Arbre de la démo de relance interactive présentée dans le Hero. 3 messages
// Cartwyn envoyés en séquence, 3 réponses possibles à chaque étape côté
// client, soit 3 x 3 x 3 = 27 parcours. Voir CLAUDE.md — la démo se place du
// point de vue du client final ("vous" = la personne relancée), pour que le
// visiteur (l'e-commerçant) ressente ce que vivent ses propres clients.
// Volontairement 18 issues négatives sur 27 (largement au-dessus du minimum
// d'1/3) : un taux de conversion de 33% reste généreux pour de la relance
// panier abandonné, et chaque issue négative porte une qualification du
// frein d'achat — la vraie valeur de Cartwyn ne s'arrête pas aux ventes
// récupérées.

export type Outcome = {
  type: "conversion" | "non-conversion";
  qualification: string;
};

export type Leaf = {
  id: string;
  clientText: string;
  outcome: Outcome;
};

export type Node3 = {
  cartwynText: string;
  replies: [Leaf, Leaf, Leaf];
};

export type Branch2 = {
  id: string;
  clientText: string;
  next: Node3;
};

export type Node2 = {
  cartwynText: string;
  replies: [Branch2, Branch2, Branch2];
};

export type Branch1 = {
  id: string;
  clientText: string;
  next: Node2;
};

export type Root = {
  cartwynText: string;
  replies: [Branch1, Branch1, Branch1];
};

function node3(cartwynText: string, replies: [Leaf, Leaf, Leaf]): Node3 {
  return { cartwynText, replies };
}

function leaf(id: string, clientText: string, outcome: Outcome): Leaf {
  return { id, clientText, outcome };
}

const nodeAA = node3(
  "Top, merci Claire ! Votre commande est en cours de traitement 🎉",
  [
    leaf("AAA", "Reçu, merci pour le geste !", {
      type: "conversion",
      qualification: "Livraison offerte a fait la différence au bon moment.",
    }),
    leaf("AAB", "Parfait, dernière question : le retour est possible ?", {
      type: "conversion",
      qualification: "Achat confirmé, question logistique post-achat seulement.",
    }),
    leaf("AAC", "Finalement je vais annuler, désolée.", {
      type: "non-conversion",
      qualification:
        "Rétractation de dernière minute malgré l'incitation — frein de confiance probable.",
    }),
  ]
);

const nodeAB = node3(
  "Avec la livraison offerte, le total reste à [prix]€ — aucun frais caché 🙂 [lien]",
  [
    leaf("ABA", "Ah nickel, je valide alors !", {
      type: "conversion",
      qualification: "Le doute portait sur le prix total affiché, pas sur le produit.",
    }),
    leaf("ABB", "D'accord, je regarde ça ce soir.", {
      type: "non-conversion",
      qualification: "Clarification reçue mais décision reportée — pas d'urgence perçue.",
    }),
    leaf("ABC", "C'est encore trop cher pour moi, merci.", {
      type: "non-conversion",
      qualification: "Frein prix confirmé : budget insuffisant pour ce panier.",
    }),
  ]
);

const nodeAC = node3(
  "Je comprends 🙂 L'offre livraison reste valable jusqu'à ce soir seulement : [lien]",
  [
    leaf("ACA", "Bon, allez, je finalise avant ce soir !", {
      type: "conversion",
      qualification: "L'échéance du soir a débloqué une décision en attente.",
    }),
    leaf("ACB", "Je compare encore un peu, je verrai.", {
      type: "non-conversion",
      qualification: "Comparaison concurrentielle en cours, aucun frein produit identifié.",
    }),
    leaf("ACC", "Non, j'ai trouvé moins cher ailleurs.", {
      type: "non-conversion",
      qualification: "Perdu face à un concurrent sur le prix.",
    }),
  ]
);

const nodeBA = node3(
  "Bien sûr ! [détail produit demandé] — ça répond à votre question ?",
  [
    leaf("BAA", "Ah top, je finalise !", {
      type: "conversion",
      qualification: "L'info produit manquante était l'unique frein à l'achat.",
    }),
    leaf("BAB", "Merci, je vais y réfléchir avec cette info.", {
      type: "non-conversion",
      qualification: "Information fournie mais aucune urgence déclenchée.",
    }),
    leaf("BAC", "En fait ça ne correspond pas à ce que je cherche.", {
      type: "non-conversion",
      qualification: "Mauvais fit produit — pas un problème de prix ou de confiance.",
    }),
  ]
);

const nodeBB = node3(
  "Je comprends. Voici -10% valable 48h si ça peut aider : [code]",
  [
    leaf("BBA", "Avec le code ça passe, je commande !", {
      type: "conversion",
      qualification: "Levier prix a suffi à débloquer un budget serré.",
    }),
    leaf("BBB", "Même avec le code c'est encore trop juste.", {
      type: "non-conversion",
      qualification: "Budget réellement insuffisant, pas une simple perception prix.",
    }),
    leaf("BBC", "Je garde le code pour une prochaine fois, merci.", {
      type: "non-conversion",
      qualification: "Intérêt réel mais timing d'achat pas encore là.",
    }),
  ]
);

const nodeBC = node3(
  "Entendu, je n'insiste pas. Votre panier reste disponible si vous changez d'avis : [lien]",
  [
    leaf("BCA", "En fait, allez, je le prends quand même.", {
      type: "conversion",
      qualification: "Le fait de ne plus insister a débloqué la décision.",
    }),
    leaf("BCB", "…", {
      type: "non-conversion",
      qualification: "Silence radio — désintérêt probable, aucun frein qualifiable.",
    }),
    leaf("BCC", "Merci, mais non, j'arrête là.", {
      type: "non-conversion",
      qualification: "Décision ferme d'abandon, aucun levier identifié.",
    }),
  ]
);

const nodeCA = node3(
  "Vous avez raison, je vérifie — [ajustement du prix confirmé] : [lien]",
  [
    leaf("CAA", "Ah d'accord, ça change tout, je commande !", {
      type: "conversion",
      qualification: "Objection prix résolue par une clarification factuelle.",
    }),
    leaf("CAB", "Ça reste plus cher que ce que j'avais vu, désolée.", {
      type: "non-conversion",
      qualification: "Écart de prix perçu non résolu — frein prix confirmé.",
    }),
    leaf("CAC", "Peu importe, je n'achète plus ici de toute façon.", {
      type: "non-conversion",
      qualification: "Rupture de confiance : le prix n'est qu'un prétexte.",
    }),
  ]
);

const nodeCB = node3(
  "Avec plaisir. Petit rappel demain si le panier est toujours là, sinon bonne journée 🙂",
  [
    leaf("CBA", "Finalement je viens de commander, merci du rappel !", {
      type: "conversion",
      qualification: "Un rappel discret, sans pression, a suffi à convertir.",
    }),
    leaf("CBB", "Je n'ai pas eu le temps d'y retourner, désolée.", {
      type: "non-conversion",
      qualification: "Manque de temps / priorité basse — pas un frein produit.",
    }),
    leaf("CBC", "…", {
      type: "non-conversion",
      qualification: "Aucune réponse après deux relances — désengagement total.",
    }),
  ]
);

const nodeCC = node3(
  "Compris, je respecte votre choix — plus aucune relance sur ce panier. Bonne continuation 🙂",
  [
    leaf("CCA", "Merci pour la compréhension.", {
      type: "non-conversion",
      qualification: "Désinscription respectée — aucune relance supplémentaire, par choix.",
    }),
    leaf("CCB", "En fait c'est le service client qui m'a déçue, pas le produit.", {
      type: "non-conversion",
      qualification: "Frein réel identifié : expérience service client, pas le produit.",
    }),
    leaf("CCC", "…", {
      type: "non-conversion",
      qualification: "Sortie silencieuse du parcours, confirmée.",
    }),
  ]
);

export const smsConversation: Root = {
  cartwynText:
    "Bonjour Claire 👋 vous avez laissé quelque chose dans votre panier chez [Boutique] — il vous attend encore : [lien]",
  replies: [
    {
      id: "A",
      clientText: "Ah oui, merci ! Je regarde ça.",
      next: {
        cartwynText: "Parfait ! Petit plus si vous finalisez aujourd'hui : livraison offerte 🙂 [lien]",
        replies: [
          { id: "AA", clientText: "C'est parti, je finalise maintenant !", next: nodeAA },
          { id: "AB", clientText: "Il revient à combien avec la livraison offerte ?", next: nodeAB },
          { id: "AC", clientText: "Je vais quand même encore comparer ailleurs.", next: nodeAC },
        ],
      },
    },
    {
      id: "B",
      clientText: "Je réfléchis encore, pas sûre.",
      next: {
        cartwynText: "Pas de souci, prenez votre temps 🙂 Si une question vous freine, je peux y répondre ici.",
        replies: [
          { id: "BA", clientText: "En fait oui, il me manque une info sur le produit.", next: nodeBA },
          { id: "BB", clientText: "C'est surtout une question de budget en ce moment.", next: nodeBB },
          { id: "BC", clientText: "Non c'est bon, laissez tomber.", next: nodeBC },
        ],
      },
    },
    {
      id: "C",
      clientText: "Non merci, plus intéressée.",
      next: {
        cartwynText: "Pas de souci ! Si vous changez d'avis, votre panier reste disponible 48h : [lien]",
        replies: [
          { id: "CA", clientText: "En fait le prix a changé depuis, c'est pour ça.", next: nodeCA },
          { id: "CB", clientText: "Très bien, merci.", next: nodeCB },
          { id: "CC", clientText: "Non c'est définitif, ne me recontactez plus.", next: nodeCC },
        ],
      },
    },
  ],
};
