# CLAUDE.md

Ce fichier donne à Claude Code le contexte permanent du projet. Place-le à la racine du dépôt — il est relu automatiquement à chaque session de travail sur ce code.

## Le projet

Site vitrine de **Cartwyn**, service qui installe et gère pour des e-commerçants français (Shopify/PrestaShop, 100-1 000 commandes/mois) un système de relance automatique des paniers abandonnés, avec qualification du frein d'achat et reporting mensuel du CA réellement récupéré.

Le contenu détaillé (copy, structure des sections, arc narratif du scroll) est spécifié dans le prompt de génération initial. Ce fichier ne le répète pas — il fixe les règles à respecter pour toute évolution ultérieure du code.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion pour les animations de scroll
- Déploiement cible : Vercel

## Commandes

```
npm run dev      # serveur de développement
npm run build    # build de production
npm run lint     # vérification du code
```

## Système de design — à respecter partout

- **Palette** : fond crème `#F3ECE1`, texte brun `#2B2117`, accent unique terracotta `#B85C38`. Pas de bleu, pas de violet, pas de dégradé.
- **Typographie** : `Fraunces` pour tous les titres, `DM Sans` pour le corps de texte. Chargées via `next/font`.
- **Illustrations** : style dessiné à la main / éditorial (SVG), jamais d'iconographie tech générique (pas de robot, pas de puce, pas de néon).
- Toute nouvelle section doit respecter cette palette et cette typographie sans exception — ne pas introduire de nouvelles couleurs ou polices sans en discuter d'abord.

## Règles non négociables

1. **Jamais "IA" ou "agent IA" en avant.** Aucun titre, sous-titre ou argument principal ne met en avant la technologie. On vend un résultat (CA récupéré) et une marque, pas une prouesse technique.

2. **Pas de storytelling personnel ni de photo de fondateur.** Cartwyn se présente comme une marque, pas comme une personne. La section "à propos" reste institutionnelle (méthode, transparence, accompagnement) — ne jamais y ajouter de photo, de prénom ou de biographie individuelle.

3. **Zéro fausse preuve sociale.** Pas de témoignage inventé, pas de logo client fictif, pas de chiffre de résultat qui ne provient pas d'un vrai client Cartwyn. Tant qu'il n'y a pas de client réel, ne pas ajouter de section "ils nous font confiance".

4. **Tout chiffre statistique cité doit avoir une source réelle et vérifiable**, affichée en petit texte sous le chiffre.

5. **Un seul fichier source de vérité pour la tarification** (`lib/pricing.ts` ou équivalent). Les montants ne doivent jamais être codés en dur ailleurs.

6. **Le simulateur de CA récupérable doit rester conforme à sa formule documentée** (taux d'abandon 70%, taux de récupération conservateur 10%) et toujours afficher la mention "estimation indicative".

7. **`prefers-reduced-motion` doit toujours être respecté.** Toute nouvelle animation de scroll doit avoir un état statique de repli quand cette préférence est activée — ce n'est pas optionnel.

8. **RGPD non négociable** : aucun cookie non essentiel déposé avant consentement explicite via le bandeau.

9. **Un seul CTA principal par section visible à l'écran.**

10. **Les animations de scroll servent le récit, pas l'inverse.** Concentrer les effets spectaculaires sur la première moitié de la page (hero → simulateur) ; garder les sections tarifs/garantie/FAQ/contact sobres, pour ne pas distraire au moment de la conversion.

## Conventions de code

- Composants React réutilisables, un composant = une responsabilité claire.
- Animations de scroll via Framer Motion (`useScroll`, `useTransform`, `whileInView`) — éviter le canvas/WebGL lourd pour ce projet.
- Commentaires en français aux endroits qui nécessitent une action manuelle du porteur du projet (clés API, contenu légal à finaliser, adresse email de réception).
- Pas de `localStorage` en dehors de la gestion du consentement cookies.
- Accessibilité : contrastes suffisants, `alt` sur les images, navigation clavier fonctionnelle, respect de `prefers-reduced-motion`.
- Performance : viser un score Lighthouse > 85 (les animations de scroll ont un coût, à surveiller).

## Pages légales

Les pages `/mentions-legales`, `/politique-de-confidentialite` et `/cgv` contiennent des champs à finaliser (statut juridique, SIREN, hébergeur) — ne jamais les supprimer ni les laisser vides même en développement.