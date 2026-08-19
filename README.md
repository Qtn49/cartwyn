# Cartwyn

Site vitrine de Cartwyn — relance automatique des paniers abandonnés pour e-commerçants Shopify/PrestaShop, qualification du frein d'achat, reporting mensuel du CA récupéré.

Voir [CLAUDE.md](./CLAUDE.md) pour les règles de design, la structure narrative et les conventions de code.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS, Framer Motion
- Déploiement : conteneur Docker sur un serveur dédié (OVHcloud), reverse proxy Caddy

## Développement local

```bash
npm install
cp .env.example .env.local   # renseigner les vraies valeurs
npm run dev      # serveur de développement
npm run build    # build de production
npm run lint      # vérification du code
```

## Déploiement en production

Le serveur de production (`ubuntu@51.210.40.108`) héberge le site dans un conteneur Docker, derrière un reverse proxy **Caddy installé au niveau système** (pas dans `docker-compose.yml` — Caddy gère lui-même le certificat HTTPS Let's Encrypt pour `cartwyn.fr` / `www.cartwyn.fr` via `/etc/caddy/Caddyfile`).

### Premier déploiement

1. Se connecter en SSH au serveur : `ssh ubuntu@51.210.40.108`.
2. Cloner le dépôt dans `/home/ubuntu/cartwyn`.
3. Créer `/home/ubuntu/cartwyn/.env.production` **directement sur le serveur** (ce fichier n'est jamais committé — voir `.env.production.example` pour la liste des variables attendues). Important : les variables `NEXT_PUBLIC_*` sont figées dans le bundle client par Next.js **au moment du build**, donc ce fichier doit exister avec les bonnes valeurs *avant* `docker compose build`, pas seulement avant `docker compose up`.
4. Installer et configurer Caddy (`/etc/caddy/Caddyfile`) avec le nom de domaine réel, `reverse_proxy localhost:3000`.
5. `docker compose build && docker compose up -d`.

### Mises à jour ultérieures

Utiliser [`deploy.sh`](./deploy.sh), à exécuter **depuis le serveur** (ou via `ssh ubuntu@51.210.40.108 'cd /home/ubuntu/cartwyn && ./deploy.sh'` depuis une machine locale disposant de l'accès SSH) :

```bash
./deploy.sh
```

Si une variable `NEXT_PUBLIC_*` a changé, mettre à jour `.env.production` sur le serveur **avant** de lancer `deploy.sh`, sinon le rebuild embarquera l'ancienne valeur.

## Secrets

Aucun secret réel (endpoint Formspree, domaine Plausible, clé SSH du serveur) ne doit jamais apparaître dans ce dépôt Git, un commit, ou une sortie de log. Les vraies valeurs vivent uniquement dans `/home/ubuntu/cartwyn/.env.production` sur le serveur de production.
