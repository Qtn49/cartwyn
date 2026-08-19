#!/usr/bin/env bash
# Script de mise à jour pour le serveur de production. À exécuter depuis le
# serveur lui-même (ou via `ssh ubuntu@51.210.40.108 'cd /home/ubuntu/cartwyn && ./deploy.sh'`
# depuis une machine locale disposant de l'accès SSH) — pas en local sur un
# poste de développement, ce script ne fait rien d'utile ailleurs que sur le
# serveur où /home/ubuntu/cartwyn/.env.production existe déjà.
#
# Rappel : les variables NEXT_PUBLIC_* sont figées dans le bundle client par
# Next.js au moment du build. Si une valeur a changé, mettre à jour
# .env.production AVANT de lancer ce script, sinon le rebuild embarquera
# l'ancienne valeur.

set -euo pipefail

cd "$(dirname "$0")"

git pull
docker compose build
docker compose up -d --force-recreate
docker compose ps
