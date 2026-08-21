# CLAUDE.md

Ce fichier donne à Claude Code le contexte permanent du projet. Place-le à la racine du dépôt — il est relu automatiquement à chaque session de travail sur ce code.

## Le projet

Site vitrine de **Cartwyn**, service qui installe et gère pour des e-commerçants français (Shopify/PrestaShop, 100-1 000 commandes/mois) un système de relance automatique des paniers abandonnés, avec qualification du frein d'achat et reporting mensuel du CA réellement récupéré.

Le contenu détaillé (copy, structure des sections, arc narratif du scroll) est spécifié dans le prompt de génération initial. Ce fichier ne le répète pas — il fixe les règles à respecter pour toute évolution ultérieure du code.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion pour les animations de scroll
- Déploiement cible : serveur Docker dédié (OVHcloud, voir section Déploiement plus bas) — pas Vercel.

## Commandes

```
npm run dev      # serveur de développement
npm run build    # build de production
npm run lint     # vérification du code
```

## Système de design — à respecter partout (v3, luxe clair)

- **Palette** : fond dominant crème `#F3ECE1` (presque blanc cassé, pas un blanc pur) sur la quasi-totalité des sections, texte/contenu en encre profonde `#12100D`, accent unique bronze/cuivre sourd `#8C5A34` — utilisé en très petites touches (traits fins, chiffres clés, petites capitales), jamais en aplat de bouton. L'encre profonde en fond n'est utilisée que dans 1-2 sections maximum (une respiration), jamais comme fond dominant comme dans la v2. Cette inversion (v2 sombre → v3 claire) ne réintroduit PAS le problème de la v1 : l'illustration de panier dessinée à la main et le bouton plein en pilule restent bannis (voir règle suivante), c'est ça qui rendait la v1 enfantine, pas la couleur claire en soi.
- **Pas d'illustration littérale d'objet** (fini le panier dessiné à la main). Remplacer par des marques graphiques abstraites minimales (une ligne, un trait géométrique simple) ou par du vide/espace négatif assumé. Aucune forme "mignonne", aucun visage, aucune courbe qui évoque un sourire ou une expression.
- **Typographie** : `Fraunces` pour les titres, réglages resserrés et raffinés (letter-spacing ajusté, tailles généreuses avec beaucoup d'espace autour). `DM Sans` pour le corps de texte, éventuellement en petites capitales avec letter-spacing pour les labels/boutons. Chargées via `next/font`.
- **Boutons** : jamais de pilule pleine et colorée. Bordure fine (1px) couleur encre ou bronze, fond transparent par défaut, remplissage discret au survol. Angles peu arrondis (2-4px), pas de arrondi complet. Label en petites capitales avec letter-spacing.
- **Header** : fond crème transparent devenant très légèrement plus opaque au scroll (pas de flou sombre — rester dans la palette claire). Liens fins, letter-spacing large, soulignement discret au survol.
- **Animations de comptage** (count-up) : durée maximale 900ms-1,2s, easing `easeOut`.
- **Champs de formulaire à choix limité** (ex. plateforme Shopify/PrestaShop) : jamais de `<select>` HTML natif, dont le rendu casse systématiquement la charte. Utiliser un toggle à boutons segmentés (bordure fine, cohérent avec les boutons) quand il y a 2-3 choix.
- Toute nouvelle section doit respecter cette palette et cette typographie sans exception — ne pas introduire de nouvelles couleurs, de dégradés ou d'illustrations figuratives sans en discuter d'abord.

## Structure narrative de la page (v3)

L'ordre des sections sur la page d'accueil suit une logique psychologique précise, à respecter pour toute réorganisation :

1. **Accroche** — phrase qui crée un lien immédiat avec le lecteur (curiosité, pas de vente), accompagnée d'un mockup visuel (bulle SMS) qui rend le produit concret dès le premier écran.
2. **Douleur** — démonstration incontestable du problème, formulée de façon personnelle et directe.
3. **Chiffres clés** — statistiques sourcées qui viennent objectiver la douleur déjà ressentie.
4. **Simulateur de CA récupérable** — le visiteur voit SON propre chiffre, pont entre la douleur générale et la solution.
5. **Expertise Cartwyn** — chaque point de douleur listé plus haut est explicitement adressé par une capacité du service.
6. **Prix brut** — affiché clairement, avant la liste de ce qui est inclus (pré-qualifie le visiteur, évite l'effet "il faut nous contacter pour savoir combien ça coûte").
7. **Ce qui est inclus** — la liste complète des services, qui vient justifier le prix déjà vu. Se termine par un CTA.
8. **Offre actuelle** — la grille tarifaire par palier avec le tarif fondateur (voir règle 11).
9. **Comment ça se passe ensuite** — anciennement "Comment ça marche", repositionné juste avant le formulaire pour rassurer sur l'effort/la suite plutôt que d'expliquer le fonctionnement technique en milieu de page.
10. **Formulaire de contact.**

## Règles non négociables

1. **Jamais "IA" ou "agent IA" en avant.** Aucun titre, sous-titre ou argument principal ne met en avant la technologie. On vend un résultat (CA récupéré) et une marque, pas une prouesse technique.

2. **Pas de storytelling personnel ni de photo de fondateur.** Cartwyn se présente comme une marque, pas comme une personne. La section "à propos" reste institutionnelle (méthode, transparence, accompagnement) — ne jamais y ajouter de photo, de prénom ou de biographie individuelle visible sur la page. Exception limitée : une donnée structurée (JSON-LD `Person`, invisible à l'écran) identifiant le fondateur peut exister pour le signal d'autorité SEO/IA (voir section SEO et référencement IA) — ça ne déroge pas à cette règle tant que rien de personnel n'apparaît visuellement sur le site.

3. **Zéro fausse preuve sociale.** Pas de témoignage inventé, pas de logo client fictif, pas de chiffre de résultat qui ne provient pas d'un vrai client Cartwyn. Tant qu'il n'y a pas de client réel, ne pas ajouter de section "ils nous font confiance".

4. **Tout chiffre statistique cité doit avoir une source réelle et vérifiable**, affichée en petit texte sous le chiffre.

5. **Un seul fichier source de vérité pour la tarification** (`lib/pricing.ts` ou équivalent). Les montants ne doivent jamais être codés en dur ailleurs. Structure attendue : un tableau de 3 paliers (`essentiel`, `croissance`, `volume`), chacun avec sa tranche de commandes/mois et un tarif plein unique (pas de tarif réduit séparé, voir règle 11).

6. **Le simulateur de CA récupérable doit rester conforme à sa formule documentée** (taux d'abandon 70%, taux de récupération conservateur 10%) et toujours afficher la mention "estimation indicative".

7. **`prefers-reduced-motion` doit toujours être respecté.** Toute nouvelle animation de scroll doit avoir un état statique de repli quand cette préférence est activée — ce n'est pas optionnel.

8. **RGPD non négociable** : aucun cookie non essentiel déposé avant consentement explicite via le bandeau.

9. **Un seul CTA principal par section visible à l'écran.** Le CTA nomme toujours ce que la personne reçoit ("Recevoir mon audit gratuit"), jamais une action générique ("Commencer maintenant", "S'inscrire") — il n'y a pas de produit en self-service, un CTA générique créerait une fausse attente d'accès immédiat.

9bis. **Pas de Calendly ni de prise de rendez-vous programmée.** Le parcours de conversion se termine par un formulaire (avec champ téléphone obligatoire) et un message de confirmation qui annonce un délai de rappel précis et tenable. Le suivi commercial se fait par appel/email direct, pas par un outil de réservation de créneau.

9ter. **Déploiement sur serveur Docker dédié** (plus d'hébergement mutualisé Hostinger). `next.config.js` utilise `output: 'standalone'` (pas `'export'`) pour un déploiement Docker optimisé. Le formulaire de contact continue de poster côté client vers Formspree (`NEXT_PUBLIC_FORMSPREE_ENDPOINT`) — on garde cette solution simple même si le serveur Docker pourrait supporter une route API, pour ne pas dépendre d'un service d'envoi d'email supplémentaire à configurer.

## Déploiement

- `Dockerfile` (build multi-stage) et `docker-compose.yml` à la racine — voir les prompts de correction pour leur contenu exact, ne pas les régénérer différemment.
- Dépôt GitHub : `git@github.com:Qtn49/cartwyn.git` (remote `origin`, branche `main`).

### Serveur de production

- Hébergeur : OVHcloud VPS-1 (2 vCores / 4GB RAM / 40GB SSD NVMe), zone EU.
- Adresse IP : `51.210.40.108`
- Utilisateur : `ubuntu`
- Accès : SSH par clé uniquement (pas de mot de passe) — connexion via `ssh ubuntu@51.210.40.108`.
- Reverse proxy : Caddy, certificats HTTPS Let's Encrypt automatiques — nécessite que le DNS du domaine pointe déjà vers cette IP avant le premier déploiement (sinon l'émission du certificat échoue).
- `.env.production` contient les secrets réels (endpoint Formspree, domaine Plausible, `ANTHROPIC_API_KEY`, etc.) — n'existe que sur le serveur, jamais commité dans le dépôt Git.
- Analytics auto-hébergé : Plausible Community Edition tourne dans son propre `docker-compose` sous `/home/ubuntu/plausible` (conteneurs séparés du site), exposé en interne seulement — c'est le Caddy système (celui qui sert `cartwyn.fr`) qui fait le reverse-proxy vers `analytics.cartwyn.fr`, pas le Caddy embarqué du compose Plausible (désactivé pour éviter un conflit de port 80/443).

10. **Les animations de scroll servent le récit, pas l'inverse.** Concentrer les effets spectaculaires sur la première moitié de la page (hero → simulateur) ; garder les sections tarifs/garantie/FAQ/contact sobres, pour ne pas distraire au moment de la conversion.

11. **Un seul tarif plein par palier, jamais de tarif réduit ni de prix barré.** 3 paliers (Essentiel 100-300 commandes/mois — 300€/mois, Croissance 300-700 — 600€/mois, Volume 700-1000+ — 1200€/mois). Pas de "tarif fondateur" affiché : le levier d'acquisition n'est pas une remise, c'est le mécanisme du mois 1 (voir règle 12). Zéro frais d'installation, tous paliers confondus. Les "places" mentionnées sur le site (3 par palier) sont des places d'intégration prioritaire (accompagnement personnalisé, capacité réelle), jamais présentées comme liées au prix.

12. **Mois 1 : commission uniquement, plafonnée au tarif standard du palier.** Aucun abonnement facturé le premier mois — uniquement une commission sur le CA attribué via les liens de relance trackés. Cette commission est plafonnée au montant du tarif standard du palier du client : il ne paie donc jamais plus cher qu'un abonnement classique dès le premier mois, et peut payer moins si le CA récupéré ne couvre pas ce plafond. C'est ce mécanisme, pas un rabais, qui doit porter l'argument "sans risque" partout sur le site.

13. **Démo de relance interactive, pas un exemple statique.** La section qui montre un exemple de relance est un fil de conversation SMS interactif à embranchements (3 messages Cartwyn en séquence, correspondant aux 3 relances réelles du service ; à chaque étape le visiteur choisit une des 3 réponses "client" possibles, soit 27 parcours possibles au total). Au moins un tiers des issues finales doit être négatif (client qui ne convertit pas) pour rester crédible — cohérent avec la règle 3 (zéro fausse preuve sociale). Ne jamais afficher de légende du type "Exemple de relance" : le format (bulles de conversation, chrome de téléphone) doit suffire à rendre l'usage évident sans l'expliciter.

14. **Analytics privacy-friendly avec événements custom.** Pas de Google Analytics — un outil respectueux du RGPD (type Plausible), chargé via variable d'environnement. Événements à tracker au minimum : soumission du formulaire, interaction avec le simulateur, interaction avec la démo SMS, clic sur un CTA principal.

15. **Case de consentement RGPD sur le formulaire de contact**, distincte du bandeau cookies — non cochée par défaut, obligatoire pour soumettre.

16. **Fondations SEO techniques toujours à jour** : sitemap.xml, robots.txt (avec autorisation explicite des crawlers IA, voir section SEO et référencement IA), meta title/description par page, schema.org `Organization` en JSON-LD, Open Graph/Twitter Card, favicon complet, page 404 personnalisée. Ne pas investir dans un balisage FAQPage schema.org — Google a supprimé les rich results FAQ en mai 2026, ça n'a plus d'effet SEO visible ; le contenu FAQ reste en revanche une section visible normale de la page (bon format pour l'extraction par les moteurs IA, indépendamment du balisage).

17. **Jamais de secret commité.** `.env.production`, tout token/clé API, et la clé privée SSH du serveur ne doivent jamais apparaître dans un commit, un fichier suivi par Git, une capture d'écran ou une sortie de log — `.env*` (sauf `.env.example`) doit rester dans `.gitignore`.

18. **Chatbot (Claude Haiku) strictement scopé à Cartwyn.** Le widget ne se présente jamais comme une "IA" ou un "assistant IA" dans son UI (cohérent avec la règle 1) — juste "Une question ?". Le system prompt est reconstruit à chaque requête à partir de `lib/pricing.ts` et des faits réels du service, jamais de chiffres dupliqués en dur qui pourraient diverger. En cas de question hors-sujet ou d'incertitude, il redirige systématiquement vers `contact@cartwyn.fr` — jamais de refus sec ("je n'ai pas le droit d'en parler"). Contrôle de coût obligatoire : `max_tokens` plafonné, historique de conversation tronqué, rate-limiting par IP. La clé `ANTHROPIC_API_KEY` ne vit que côté serveur (`.env.production`), jamais exposée au client. Le widget ne s'active qu'après consentement à la catégorie "Chat" du bandeau cookies (règle 8) ; aucune conversation n'est journalisée au-delà du traitement de la requête en cours.

19. **Prospection (cold email) : confidentialité et anti-dérive non négociables.** Les listes de prospects (`prospection/listes/`, y compris les fichiers générés dans `clean/`), les logs d'envoi et la liste de suppression contiennent des données personnelles (noms, emails) — jamais commitées dans Git, qu'il s'agisse des exports bruts ou des fichiers dérivés (`.gitignore` dédié dans `prospection/`). Aucun envoi réel sans : lien/mention de désabonnement + header `List-Unsubscribe`, montée en charge progressive (warmup) prudente, et vérification préalable que SPF/DKIM/DMARC résolvent. **Le cold email part depuis `cartwyn.fr` — décision finale prise le 20/08/2026 après avoir évalué et écarté un domaine satellite (`cartwyn.online`, abandonné à cause d'une pénalité structurelle de son TLD sur les filtres anti-spam) ; ne pas rouvrir ce débat sans qu'il soit explicitement redemandé.** En contrepartie du choix de `cartwyn.fr`, `send_sequence.py` doit toujours : vérifier qu'aucun enregistrement DNS existant du site n'est dupliqué/cassé par l'ajout de Resend (voir section Prospection), faire tourner un circuit-breaker automatique sur le taux de bounce/plaintes, et vérifier l'absence de `cartwyn.fr` sur Spamhaus DBL avant chaque batch réel. Le script d'envoi tourne toujours en mode aperçu par défaut (génère sans envoyer) ; l'envoi réel est un flag explicite, jamais le comportement par défaut.

## SEO et référencement IA (GEO)

Mots-clés cibles validés (pour meta title/description, intertitres, contenu on-page) : `abandon panier ecommerce`, `meilleur outil relance panier abandonné`, `augmenter taux de conversion ecommerce`. Les mapper aux sections les plus pertinentes existantes plutôt que de forcer du nouveau contenu — pas de sur-optimisation/bourrage de mots-clés. `fidéliser client ecommerce` a été retiré de cette liste (audit SEO complet, 21/08/2026) : cette requête cible la rétention client, pas la récupération de panier abandonné que Cartwyn résout — décalage d'intention, ne pas le forcer dans le contenu.

**Hôte canonique : `cartwyn.fr` (sans www)**, décidé lors de l'audit SEO complet — cohérent avec l'adresse `quentin@cartwyn.fr`, les enregistrements DNS SPF/DKIM/DMARC et toute la documentation. `www.cartwyn.fr` et `http://cartwyn.fr` redirigent en 308 vers `https://cartwyn.fr`, jamais l'inverse.

**Ce qui a un impact réel confirmé pour l'IA générative (ChatGPT, Perplexity, AI Overviews)** : structurer le contenu pour l'extraction (intertitres formulés comme de vraies questions, réponse directe en 40-60 mots en tête de section, paragraphes courts), section FAQ visible avec réponses directes, chiffres/statistiques sourcés mis en avant (déjà couvert par la règle 4 — zéro chiffre inventé). Autoriser explicitement les crawlers IA dans `robots.txt` : `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended` — sans ça le site n'est simplement pas éligible à être cité. S'assurer que le contenu critique (hero, douleur, chiffres clés) est bien rendu côté serveur (SSR/SSG Next.js), pas seulement injecté en JS client, que certains crawlers IA ne rendent pas bien.

**Ce qui est contesté / à ne pas sur-investir** : le balisage schema.org (au-delà d'`Organization`) et les fichiers `llms.txt` n'ont pas d'effet mesurable confirmé sur les citations IA selon la documentation Google la plus récente (voir règle 16) — les implémenter reste peu coûteux pour le SEO classique, mais ne pas les présenter comme le levier principal.

**Signal d'autorité fondateur (E-E-A-T)** : une bio fondateur existe pour un usage en donnée structurée (`Person` JSON-LD, potentiellement réutilisable comme signature d'article le jour où le blog est lancé) — jamais affichée visuellement sur les pages actuelles du site, conformément à la règle 2.

> Quentin Guez est ingénieur informatique de formation. Développeur avant tout, il conçoit et construit lui-même les outils qu'il lance — de projets techniques personnels à Cartwyn, qu'il a fondé pour mettre cette expertise au service d'un problème très concret : chaque mois, les e-commerçants perdent des ventes déjà à moitié conclues, faute d'un suivi rigoureux des paniers abandonnés. Son approche : une exigence technique réelle au service d'un résultat mesurable, pas un argumentaire marketing.

Version courte (meta/description schema) : "Ingénieur informatique, développeur full-stack, fondateur de Cartwyn — il construit lui-même chaque brique technique du service qu'il propose aux e-commerçants."

**Mesure** : vérifier dans Plausible (onglet Sources) que les référents `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `bing.com` remontent bien — pas de développement spécifique nécessaire, juste une vérification et une habitude de suivi mensuel.

**Fraîcheur** : contenu marketing statique, pas de blog actif pour l'instant (différé aux premiers clients pilotes) — pas de mécanisme de fraîcheur à construire maintenant, à reconsidérer au lancement du blog.

## Conventions de code

- Composants React réutilisables, un composant = une responsabilité claire.
- Animations de scroll via Framer Motion (`useScroll`, `useTransform`, `whileInView`) — éviter le canvas/WebGL lourd pour ce projet.
- Commentaires en français aux endroits qui nécessitent une action manuelle du porteur du projet (clés API, contenu légal à finaliser, adresse email de réception).
- Pas de `localStorage` en dehors de la gestion du consentement cookies.
- Accessibilité : contrastes suffisants **y compris sur les éléments d'interface superposés** (bandeau cookies, modales, tooltips — pas seulement le contenu de page), `alt` sur les images, navigation clavier fonctionnelle, respect de `prefers-reduced-motion`.
- Performance : viser un score Lighthouse > 85 (les animations de scroll ont un coût, à surveiller).

## Pages légales

Les pages `/mentions-legales`, `/politique-de-confidentialite` et `/cgv` sont finalisées avec les données réelles du porteur du projet (statut micro-entreprise/forme libérale, SIREN, adresse, contact, hébergeur OVHcloud) depuis le prompt de correction #7 — voir ce prompt pour le contenu exact. Ne plus jamais les faire régresser vers un placeholder `[à compléter]` une fois remplies ; si une information doit changer (ex. changement d'adresse), la mettre à jour partout où elle apparaît plutôt que de la vider.

## Prospection (cold email)

Dossier `prospection/`, séparé du code du site (pas de dépendance vers `app/`/`lib/` du site principal, à part la cohérence de ton/marque). Pipeline en 2 étapes actives (une troisième, Haiku, a été essayée puis abandonnée — voir plus bas), chacune ré-exécutable indépendamment :

1. `prospection/scripts/clean_prospection_lists.py` — fusionne les exports StoreInspect de `prospection/listes/`, déduplique par email (plus par domaine depuis le prompt de correction #2 prospection — les contacts génériques sont désormais gardés, voir ce prompt), exclut les boutiques déjà équipées d'un outil concurrent et les statuts d'email non fiables. Sort `prospection/listes/clean/master-{date}.csv` + `exclus-{date}.csv`.
2. `prospection/scripts/send_sequence.py` — fusionne les 4 templates de `prospection/templates/` avec les données de chaque contact (accroche déterministe par table de correspondance `category` → français, pas d'appel LLM — voir plus bas), envoie via Resend (relais tiers, jamais de SMTP brut depuis le VPS OVH, IP sans réputation) depuis `cartwyn.fr`, avec warmup prudent, capture des réponses par IMAP, et liste de suppression. Mode aperçu par défaut, envoi réel seulement via flag explicite (`--send`), plus un mode `--test-send <email>` pour un envoi de contrôle unique hors séquence réelle — voir règle 19.

**Accroche Haiku abandonnée** (prompt de correction #7) : `generate_hooks.py` a été essayé puis retiré du pipeline actif (archivé dans `prospection/scripts/archive/`) — deux corrections de ton nécessaires (vouvoiement, puis ton critique/froid) ont convaincu le porteur du projet qu'une accroche déterministe simple (table `category` → expression française, avec repli propre si non mappée) était plus fiable qu'un appel LLM pour ce cas d'usage. `ANTHROPIC_API_KEY` n'est donc plus nécessaire dans `prospection/.env` (reste nécessaire dans `.env.production` du site pour le chatbot, fichier distinct).

Le contenu des 4 emails de la séquence (J0/J3-4/J7-8/J12-14) est validé et ne doit pas être réécrit sans en discuter — texte exact : email 1 dans le prompt de correction #7 prospection (réécrit par le porteur du projet, ton chaleureux), emails 2-3 dans le prompt de correction #8 prospection, email 4 dans le prompt de correction #9 prospection (ton "porte ouverte", plus une rupture). Les prompts #1/#2/#8 (pour l'email 4 uniquement) contiennent des versions antérieures obsolètes, ne plus s'y référer pour ce texte précis. Salutation ("Hello,"/"Salut,") variée aléatoirement par envoi depuis le prompt #9.

**Envoi réel** : fenêtre restreinte à mardi/mercredi/jeudi, 9h30-11h ou 14h-15h heure de Paris (configurable en tête de `send_sequence.py`), déclenché via une tâche cron réelle sur le VPS de production. **Ne pas réintroduire Haiku dans ce pipeline** sans en discuter explicitement — décision prise au moment du lancement des premiers envois réels, le risque de dérive de ton était jugé trop élevé sans relecture possible à l'échelle (voir prompt #9).

### Domaine d'envoi et garde-fous de réputation

Le cold email part de `cartwyn.fr` — décision finale (règle 19). Pas de domaine satellite : l'essai sur `cartwyn.online` a été abandonné à cause d'une pénalité structurelle de son TLD sur les filtres anti-spam (règles SpamAssassin `FROM_SUSPICIOUS_NTLD`/`PDS_OTHER_BAD_TLD`, indépendante de toute configuration DNS).

- `cartwyn.fr` a déjà des enregistrements DNS actifs pour le site (Formspree n'en nécessite pas côté DNS, mais `contact@cartwyn.fr` reçoit déjà du courrier réel) — **toujours lister les enregistrements existants avant d'ajouter quoi que ce soit** (leçon tirée de l'épisode `cartwyn.online` : SPF et DMARC n'acceptent chacun qu'un seul enregistrement TXT par domaine ; un deuxième en parallèle casse la vérification au lieu de s'additionner). Le SPF de Resend doit être **fusionné** dans l'enregistrement SPF existant de `cartwyn.fr` (multiples `include:` dans une seule ligne), jamais ajouté comme second TXT séparé. Le DKIM Resend (TXT `resend._domainkey.cartwyn.fr`) est un sélecteur distinct, pas de conflit possible avec un DKIM existant. Le DMARC, s'il existe déjà, ne doit pas être dupliqué non plus.
- Adresse unique standardisée : `quentin@cartwyn.fr` (pas `contact@cartwyn.fr`) — utilisée pour le `From:`, la mention de désabonnement, et le compte surveillé en IMAP.
- Nom d'expéditeur affiché : **"Cartwyn"** (décision finale du porteur du projet, prompt de correction #7 — il a testé les deux options et préfère le nom de marque, en connaissance du compromis : un nom de personne aurait réduit le risque de classement en Promotions par Gmail, voir prompt de correction #6. Ne pas revenir dessus sans qu'il le redemande).
- Mention de désabonnement : une ligne courte en fin de message ("Se désinscrire : quentin@cartwyn.fr", texte brut, l'adresse s'auto-transforme en lien dans la quasi-totalité des clients mail) plutôt qu'une phrase explicative longue — reste en texte brut, jamais de HTML pour ça.
- Sujet de l'email 1 : "Petite question pour {{store_name}}".
- Garde-fous obligatoires avant tout `--send` réel : circuit-breaker automatique sur le taux de bounce/plaintes (webhooks ou API de stats Resend, à vérifier dans leur documentation actuelle) qui arrête tout envoi et bloque la reprise sans intervention manuelle en cas de dépassement de seuil ; vérification Spamhaus DBL sur `cartwyn.fr` avant chaque batch réel.
- Warmup délibérément prudent (palier de départ bas, montée lente sur plusieurs semaines) puisque c'est le domaine de production qui est exposé, pas un satellite jetable.