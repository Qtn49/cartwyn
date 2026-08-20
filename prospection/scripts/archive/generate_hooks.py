#!/usr/bin/env python3
"""Génère une accroche personnalisée par contact via Claude Haiku.

Lit master-{date}.csv (produit par clean_prospection_lists.py), appelle
Haiku pour chaque contact dont la description boutique est exploitable, et
écrit master-{date}-enrichi.csv avec la colonne store_hook en plus. Étape
ré-exécutable : un cache local évite de rappeler l'API pour un contact déjà
traité (même email + même store_description).

Usage :
    python3 generate_hooks.py                         # dernier master-*.csv trouvé
    python3 generate_hooks.py --input chemin/vers.csv  # fichier explicite
"""

from __future__ import annotations

import argparse
import glob
import hashlib
import json
import logging
import os
import re
import sys
from datetime import date

import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LISTES_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "listes"))
CLEAN_DIR = os.path.join(LISTES_DIR, "clean")
STATE_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "state"))
CACHE_PATH = os.path.join(STATE_DIR, "hooks_cache.json")

# Même modèle que le chatbot du site (app/api/chat/route.ts) : Haiku le plus
# récent, identifiant vérifié sur platform.claude.com/docs (ex-docs.claude.com).
MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 60
TEMPERATURE = 0.4

# Estimation grossière du coût, pour donner un ordre de grandeur seulement
# (tarifs à revérifier sur platform.claude.com/docs/en/about-claude/pricing
# s'ils bougent) : Haiku 4.5 = $1 / MTok en entrée, $5 / MTok en sortie.
PRICE_INPUT_PER_MTOK = 1.0
PRICE_OUTPUT_PER_MTOK = 5.0

MIN_DESCRIPTION_LENGTH = 30

# Bumper cette version invalide tout le cache existant (voir cached_entry
# plus bas) — sert à forcer une régénération de toutes les accroches après
# un changement de SYSTEM_PROMPT, sans avoir à supprimer le fichier de cache
# à la main. Incrémenté le 20/08/2026 : l'ancien prompt laissait passer du
# vouvoiement et des accroches formulées en critique ("votre site manque
# de..."), voir prospection/README.md.
PROMPT_VERSION = 2

SYSTEM_PROMPT = """Tu rédiges une seule phrase d'accroche courte (maximum 20 à 25 mots), en \
français, pour le premier email d'une prospection commerciale envoyée à un e-commerçant.

Règles strictes :
- TOUJOURS tutoyer ("tu", "ton", "tes"), JAMAIS vouvoyer ("vous", "votre") — le reste de l'email \
tutoie, l'accroche doit être cohérente avec ça.
- Ton direct et humain, jamais corporate, jamais de superlatif publicitaire ("magnifique", \
"incroyable", "unique").
- JAMAIS de critique ni de reproche, même implicite. Bannir toute formulation du type "tu \
manques de", "ton site n'a pas", "tu devrais", "il te manque". L'accroche reste neutre à \
positive : une observation sur ce que vend la boutique ou à qui elle s'adresse (le produit, la \
clientèle) — jamais un jugement sur ce qui ne va pas chez elle. La phrase qui suit dans l'email \
enchaîne sur les paniers abandonnés : l'accroche doit donc porter sur le produit/la clientèle \
pour permettre cet enchaînement naturel, pas sur une critique de leur stratégie marketing.
- La phrase doit montrer une observation réelle et spécifique sur CETTE boutique précise, basée \
strictement sur les informations fournies (nom, catégorie, description).
- N'invente JAMAIS un détail absent des informations fournies (pas de produit, pas de chiffre, \
pas de fait non mentionné).
- Si les informations fournies ne permettent pas une observation crédible et spécifique, réponds \
avec une chaîne vide, rien d'autre.
- Réponds uniquement avec la phrase (ou rien) : pas de guillemets, pas de markdown, pas de \
préambule.

Exemples (à partir d'une boutique fictive de matériel de coiffure professionnel) :

Mauvais (vouvoiement + critique implicite) :
"Vous proposez des outils coiffure haut de gamme, mais votre site manque de contenu qui montre \
vraiment comment les clients les utilisent au quotidien."

Mauvais (vouvoiement, même sans critique) :
"Vous vendez du matériel de coiffure professionnel, ça doit s'adresser à des salons exigeants."

Bon (tutoiement, observation neutre sur le produit/la clientèle) :
"J'ai vu que tu vendais du matériel de coiffure pro — ça doit toucher pas mal de salons et de \
particuliers exigeants."

Bon (tutoiement, observation sur la clientèle, ouvre naturellement sur le sujet des paniers) :
"Tu t'adresses à des professionnels de la coiffure qui commandent sûrement en quantité — ça doit \
représenter un vrai panier moyen à chaque commande."
"""

FALLBACK_TEMPLATE = "J'ai vu que {store_name} vendait du {category}."


def latest_master_csv() -> str | None:
    candidates = sorted(glob.glob(os.path.join(CLEAN_DIR, "master-*.csv")))
    candidates = [c for c in candidates if not c.endswith("-enrichi.csv")]
    return candidates[-1] if candidates else None


def load_cache() -> dict:
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict) -> None:
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2, sort_keys=True)


def description_hash(description: str) -> str:
    return hashlib.sha256(description.strip().encode("utf-8")).hexdigest()


def is_substantial(description: str) -> bool:
    significant = re.sub(r"\s+", " ", description).strip()
    return len(significant) >= MIN_DESCRIPTION_LENGTH


def fallback_hook(store_name: str, category: str) -> str:
    if not category.strip():
        return ""
    return FALLBACK_TEMPLATE.format(store_name=store_name.strip(), category=category.strip())


def call_haiku(client, store_name: str, category: str, description: str) -> str:
    user_content = (
        f"Nom de la boutique : {store_name}\n"
        f"Catégorie : {category}\n"
        f"Description : {description}"
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )
    text = "".join(block.text for block in response.content if block.type == "text").strip()
    usage = response.usage
    return text, usage.input_tokens, usage.output_tokens


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", help="Chemin vers master-{date}.csv (défaut : le plus récent trouvé dans listes/clean/)")
    args = parser.parse_args()

    input_path = args.input or latest_master_csv()
    if not input_path or not os.path.exists(input_path):
        logging.error("Aucun master-*.csv trouvé dans %s (et --input non fourni).", CLEAN_DIR)
        sys.exit(1)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logging.error(
            "ANTHROPIC_API_KEY manquante. Placez-la dans prospection/.env "
            "(voir prospection/.env.example) et chargez-la avant de lancer ce script, ex. :\n"
            "  set -a && source prospection/.env && set +a && python3 %s",
            os.path.basename(__file__),
        )
        sys.exit(1)

    try:
        import anthropic
    except ImportError:
        logging.error(
            "Le paquet 'anthropic' n'est pas installé. "
            "Installez les dépendances : pip3 install -r prospection/scripts/requirements.txt"
        )
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    df = pd.read_csv(input_path, dtype=str, keep_default_na=False)
    for col in ("contact_email", "store_description", "store_name", "category"):
        if col not in df.columns:
            logging.error("Colonne '%s' absente de %s — avez-vous lancé clean_prospection_lists.py à jour ?", col, input_path)
            sys.exit(1)

    cache = load_cache()

    hooks = []
    stats = {"cached": 0, "haiku": 0, "fallback_no_description": 0, "fallback_empty_response": 0, "fallback_api_error": 0}
    total_input_tokens = 0
    total_output_tokens = 0

    for _, row in df.iterrows():
        email_key = row["contact_email"].strip().lower()
        description = row["store_description"]
        store_name = row["store_name"]
        category = row["category"]
        desc_hash = description_hash(description)

        cached_entry = cache.get(email_key)
        if (
            cached_entry
            and cached_entry.get("description_hash") == desc_hash
            and cached_entry.get("prompt_version") == PROMPT_VERSION
        ):
            hooks.append(cached_entry["hook"])
            stats["cached"] += 1
            continue

        if is_substantial(description):
            try:
                text, in_tok, out_tok = call_haiku(client, store_name, category, description)
                total_input_tokens += in_tok
                total_output_tokens += out_tok
                if text:
                    hook = text
                    stats["haiku"] += 1
                else:
                    hook = fallback_hook(store_name, category)
                    stats["fallback_empty_response"] += 1
            except Exception as exc:  # API/réseau : ne jamais interrompre tout le batch pour une ligne
                logging.warning("Échec appel Haiku pour %s (%s) : %s", email_key, store_name, exc)
                hook = fallback_hook(store_name, category)
                stats["fallback_api_error"] += 1
        else:
            hook = fallback_hook(store_name, category)
            stats["fallback_no_description"] += 1

        cache[email_key] = {"description_hash": desc_hash, "hook": hook, "prompt_version": PROMPT_VERSION}
        hooks.append(hook)

    df["store_hook"] = hooks
    save_cache(cache)

    today = date.today().isoformat()
    output_path = os.path.join(CLEAN_DIR, f"master-{today}-enrichi.csv")
    df.to_csv(output_path, index=False)

    estimated_cost = (
        total_input_tokens / 1_000_000 * PRICE_INPUT_PER_MTOK
        + total_output_tokens / 1_000_000 * PRICE_OUTPUT_PER_MTOK
    )

    logging.info("--- Résumé accroches ---")
    logging.info("Contacts traités                 : %d", len(df))
    logging.info("Réutilisés depuis le cache        : %d", stats["cached"])
    logging.info("Accroches générées par Haiku       : %d", stats["haiku"])
    logging.info(
        "Replis (catégorie)                : %d  (dont %d description absente/trop courte, %d réponse vide, %d erreur API)",
        stats["fallback_no_description"] + stats["fallback_empty_response"] + stats["fallback_api_error"],
        stats["fallback_no_description"], stats["fallback_empty_response"], stats["fallback_api_error"],
    )
    logging.info("Appels API effectués               : %d", stats["haiku"] + stats["fallback_empty_response"] + stats["fallback_api_error"])
    logging.info(
        "Coût estimé (ordre de grandeur)   : ~$%.4f (%d tok entrée, %d tok sortie, tarifs Haiku 4.5 à revérifier si anciens)",
        estimated_cost, total_input_tokens, total_output_tokens,
    )
    logging.info("")
    logging.info("-> %s", output_path)


if __name__ == "__main__":
    main()
