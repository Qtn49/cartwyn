# CLAUDE.md

Ce fichier donne à Claude Code le contexte permanent du projet. Place-le à la racine du dépôt — il est relu automatiquement à chaque session de travail sur ce code.

## Le projet

Site vitrine de **Cartwyn**, service qui installe et gère pour des e-commerçants français (Shopify/PrestaShop, 100-1 000 commandes/mois) un système de relance automatique des paniers abandonnés, avec qualification du frein d'achat et reporting mensuel du CA réellement récupéré.

Le contenu détaillé (copy, structure des sections, arc narratif du scroll) est spécifié dans le prompt de génération initial. Ce fichier ne le répète pas — il fixe les règles à respecter pour toute évolution ultérieure du code.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion pour les animations de scroll
- Déploiement cible : serveur Docker dédié (voir `Dockerfile` / `docker-compose.yml`), `output: "standalone"` dans `next.config.ts`. Un reverse proxy (Caddy/Nginx/Traefik) gère le HTTPS sur `cartwyn.fr` directement sur le serveur, hors dépôt.

## Commandes

```
npm run dev      # serveur de développement
npm run build    # build de production (.next/standalone)
npm run lint     # vérification du code
docker compose up -d --build   # build + lancement du conteneur en local/serveur
```

## Système de design — à respecter partout

Direction **luxe / sobre**, pas éditorial-chaleureux : le crème domine, l'encre profonde est une respiration rare, l'accent bronze reste discret.

- **Palette** : fond dominant crème `#F3ECE1` (presque blanc cassé, pas un blanc pur), nuance secondaire `#ECE2D2` pour distinguer une section sans rompre la palette claire, texte/contenu encre profonde `#12100D`. L'encre profonde en fond n'apparaît que dans 1 à 2 sections maximum sur toute la page (respiration — actuellement "Chiffres clés"), jamais comme fond dominant. Accent unique bronze/cuivre sourd `#8C5A34`, utilisé en petites touches (traits fins, chiffres clés, labels) — **jamais en aplat de bouton plein**. Pas de bleu, pas de violet, pas de dégradé. Le Header et le Footer sont un chrome global distinct des sections narratives : le Header reste toujours clair (crème transparent → crème plus opaque au scroll), le Footer reste volontairement en encre profonde comme repère de bas de page — ce contraste de chrome n'entre pas dans le budget "1 à 2 sections" ci-dessus.
- **Tokens** (`app/globals.css` + `components/section-variant.ts`) : `creme`, `creme-soft`, `ink`, `bronze`. Chaque section reçoit une prop `tone: "creme" | "creme-soft" | "ink"` — ne pas coder une couleur de fond en dur dans une section, toujours passer par `sectionTokens[tone]`. `CtaButton` accepte aussi une prop `tone` pour adapter la couleur de sa bordure/texte au fond de la section qui l'entoure.
- **Typographie** : `Fraunces` pour tous les titres (letter-spacing resserré, marges généreuses autour), `DM Sans` pour le corps de texte. Labels, boutons et éléments de navigation en petites capitales avec letter-spacing large (classe utilitaire `.label`). Chargées via `next/font`.
- **Illustrations** : jamais d'objet figuratif reconnaissable (pas de panier dessiné, pas de visage, pas d'icône évoquant un sourire) et jamais d'iconographie tech générique (pas de robot, pas de puce, pas de néon). Uniquement des traits géométriques abstraits, fins, animés avec parcimonie (`components/illustrations/AbstractMark.tsx`, `Signature.tsx`) ou de l'espace négatif assumé.
- **Boutons** (`components/CtaButton.tsx`, à réutiliser partout) : jamais de pilule pleine colorée. Bordure fine 1px, fond transparent par défaut, remplissage bronze discret et progressif au survol (pas un simple changement d'opacité), angles peu arrondis (2-4px), label en petites capitales.
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