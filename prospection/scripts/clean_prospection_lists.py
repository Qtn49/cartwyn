#!/usr/bin/env python3
"""Nettoyage et dédup des listes de prospection Cartwyn (prospection/listes/).

Fusionne tous les CSV du dossier d'entrée, exclut les boutiques déjà chez un
concurrent (Klaviyo, Mailchimp, ...) et les emails au statut non fiable, puis
déduplique par adresse email exacte (les contacts génériques sont gardés :
maximiser le volume de contacts touchés est un choix assumé du porteur du
projet, quitte à toucher deux adresses différentes d'une même boutique).
Produit une liste prête à réimporter dans lemlist et un fichier d'audit des
lignes exclues.

Usage : python3 clean_prospection_lists.py
"""

from __future__ import annotations

import glob
import logging
import os
from datetime import date

import pandas as pd

# --- Chemins -----------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LISTES_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "listes"))
OUTPUT_DIR = os.path.join(LISTES_DIR, "clean")

# --- Sources connues -----------------------------------------------------
# Pour ajouter une nouvelle source (BuiltWith, export lemlist, ...) :
# ajouter une entrée avec les colonnes qui l'identifient de façon unique
# ("signature_columns") et le mapping colonne source -> colonne canonique.
# La source est détectée automatiquement à partir de l'en-tête du CSV.

SOURCE_COLUMN_MAPS = {
    "storeinspect": {
        "signature_columns": {"Store Name", "Domain", "Contact Email"},
        "mapping": {
            "Store Name": "store_name",
            "Domain": "domain",
            "Category": "category",
            "Store Description": "store_description",
            "Traffic Tier": "traffic_tier",
            "Estimated Monthly Revenue": "estimated_monthly_revenue",
            "Store Apps": "store_apps",
            "Lead Score": "lead_score",
            "Contact Name": "contact_name",
            "Contact Title": "contact_title",
            "Contact Role": "contact_role",
            "Contact Email": "contact_email",
            "Email Status": "email_status",
        },
    },
}

CANONICAL_COLUMNS = [
    "store_name", "domain", "category", "store_description", "traffic_tier",
    "estimated_monthly_revenue", "store_apps", "lead_score", "contact_name",
    "contact_title", "contact_role", "contact_email", "email_status",
]

# --- Règles de filtrage ---------------------------------------------------

GENERIC_MARKER = "generic email"

# Sous-chaîne recherchée dans "Store Apps", insensible à la casse.
# Sendinblue = ancien nom de Brevo, traité comme équivalent.
COMPETITOR_TOOLS = [
    "klaviyo", "mailchimp", "brevo", "sendinblue", "omnisend", "activecampaign",
]

# Liste blanche des statuts d'email considérés fiables. Toute valeur en
# dehors (y compris vide/inconnue) est exclue par défaut.
EMAIL_STATUS_WHITELIST = {"verified", "found"}

MASTER_COLUMNS = [
    "domain", "store_name", "category", "store_description", "first_name",
    "contact_name", "contact_email", "is_generic", "lead_score",
    "traffic_tier", "estimated_monthly_revenue", "source_file",
]

EXCLUS_COLUMNS = MASTER_COLUMNS + ["email_status", "matched_competitor_tool", "exclusion_reason"]


def detect_source(columns: set[str]) -> str | None:
    for name, cfg in SOURCE_COLUMN_MAPS.items():
        if cfg["signature_columns"].issubset(columns):
            return name
    return None


def load_all(input_dir: str) -> pd.DataFrame:
    frames = []
    csv_paths = sorted(glob.glob(os.path.join(input_dir, "*.csv")))
    for path in csv_paths:
        df = pd.read_csv(path, dtype=str, keep_default_na=False)
        source_key = detect_source(set(df.columns))
        if source_key is None:
            logging.warning("Source non reconnue, fichier ignoré : %s", os.path.basename(path))
            continue
        mapping = SOURCE_COLUMN_MAPS[source_key]["mapping"]
        df = df.rename(columns=mapping)
        for col in CANONICAL_COLUMNS:
            if col not in df.columns:
                df[col] = ""
        df = df[CANONICAL_COLUMNS].copy()
        df["source_file"] = os.path.basename(path)
        frames.append(df)

    if not frames:
        return pd.DataFrame(columns=CANONICAL_COLUMNS + ["source_file"])
    return pd.concat(frames, ignore_index=True)


def extract_first_name(contact_name: str) -> str:
    """Best-effort : premier mot du nom de contact.

    Marche tel quel pour un nom à un seul mot (marque type "Ek"). Pour un
    nom à plusieurs mots, l'ordre prénom/nom n'est pas fiable dans les
    exports (parfois "Nom Prénom", parfois "Prénom Nom") : on prend le
    premier mot sans tenter de deviner l'ordre.
    """
    words = contact_name.strip().split()
    return words[0] if words else ""


def is_generic(title: str, role: str) -> bool:
    return title.strip().lower() == GENERIC_MARKER or role.strip().lower() == GENERIC_MARKER


def matched_competitor_tools(store_apps: str) -> list[str]:
    apps_lower = store_apps.lower()
    return [tool for tool in COMPETITOR_TOOLS if tool in apps_lower]


def is_reliable_status(status: str) -> bool:
    return status.strip().lower() in EMAIL_STATUS_WHITELIST


def _to_master_row(row: pd.Series) -> dict:
    return {
        "domain": row["domain"],
        "store_name": row["store_name"],
        "category": row["category"],
        "store_description": row["store_description"],
        "first_name": row["first_name"],
        "contact_name": row["contact_name"],
        "contact_email": row["contact_email"],
        "is_generic": row["_is_generic"],
        "lead_score": row["lead_score"],
        "traffic_tier": row["traffic_tier"],
        "estimated_monthly_revenue": row["estimated_monthly_revenue"],
        "source_file": row["source_file"],
    }


def _to_exclus_row(row: pd.Series, reason: str) -> dict:
    base = _to_master_row(row)
    base["email_status"] = row["email_status"]
    base["matched_competitor_tool"] = ", ".join(row["_competitor_tools"])
    base["exclusion_reason"] = reason
    return base


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    stats = {
        "total_read": len(df),
        "generic_rows": 0,
        "competitor_domains": set(),
        "unknown_email_statuses": set(),
    }

    df = df.copy()
    df["_row_order"] = range(len(df))
    df["_is_generic"] = df.apply(lambda r: is_generic(r["contact_title"], r["contact_role"]), axis=1)
    df["_competitor_tools"] = df["store_apps"].apply(matched_competitor_tools)
    df["_is_competitor"] = df["_competitor_tools"].apply(bool)
    df["_email_key"] = df["contact_email"].str.strip().str.lower()
    df["_lead_score_num"] = pd.to_numeric(df["lead_score"], errors="coerce").fillna(-1)
    df["_reliable_status"] = df["email_status"].apply(is_reliable_status)
    df["first_name"] = df["contact_name"].apply(extract_first_name)

    stats["generic_rows"] = int(df["_is_generic"].sum())
    for status in df.loc[~df["_reliable_status"], "email_status"]:
        stripped = status.strip()
        stats["unknown_email_statuses"].add(stripped if stripped else "(vide)")

    excluded_rows = []
    master_rows = []

    # 1. Filtre concurrent : priorité la plus haute, indépendant du reste.
    is_competitor = df["_is_competitor"]
    for _, row in df[is_competitor].iterrows():
        stats["competitor_domains"].add((row["domain"].strip().lower(), ", ".join(row["_competitor_tools"])))
        excluded_rows.append(_to_exclus_row(row, "competitor_tool_detected"))

    remaining = df[~is_competitor]

    # 2. Dédup par adresse email exacte (les contacts génériques restent).
    for email_key, group in remaining.groupby("_email_key", sort=False):
        if len(group) > 1:
            winner_idx = group["_lead_score_num"].idxmax()
            winner = group.loc[winner_idx]
            for _, row in group.iterrows():
                if row["_row_order"] != winner["_row_order"]:
                    excluded_rows.append(_to_exclus_row(row, "duplicate_email_exact"))
        else:
            winner = group.iloc[0]

        # 3. Filtre statut email, sur le contact retenu pour cette adresse.
        if winner["_reliable_status"]:
            master_rows.append(_to_master_row(winner))
        else:
            excluded_rows.append(_to_exclus_row(winner, "unreliable_email_status"))

    master_out = pd.DataFrame(master_rows, columns=MASTER_COLUMNS) if master_rows else pd.DataFrame(columns=MASTER_COLUMNS)
    excl_out = pd.DataFrame(excluded_rows, columns=EXCLUS_COLUMNS) if excluded_rows else pd.DataFrame(columns=EXCLUS_COLUMNS)

    stats["excluded_by_reason"] = excl_out["exclusion_reason"].value_counts().to_dict() if len(excl_out) else {}
    stats["final_count"] = len(master_out)

    return master_out, excl_out, stats


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    df = load_all(LISTES_DIR)
    if df.empty:
        logging.warning("Aucune ligne à traiter dans %s", LISTES_DIR)
        return

    master_out, excl_out, stats = clean(df)

    today = date.today().isoformat()
    master_path = os.path.join(OUTPUT_DIR, f"master-{today}.csv")
    excl_path = os.path.join(OUTPUT_DIR, f"exclus-{today}.csv")
    master_out.to_csv(master_path, index=False)
    excl_out.to_csv(excl_path, index=False)

    logging.info("--- Résumé ---")
    logging.info("Lignes lues (toutes sources)      : %d", stats["total_read"])
    logging.info("Dont contacts génériques (gardés)  : %d", stats["generic_rows"])
    logging.info("")
    if stats["competitor_domains"]:
        logging.info("Boutiques exclues (outil concurrent détecté) : %d", len(stats["competitor_domains"]))
        for domain_key, tools in sorted(stats["competitor_domains"]):
            logging.info("  - %s (%s)", domain_key, tools)
    else:
        logging.info("Boutiques exclues (outil concurrent détecté) : 0")
    logging.info("")
    if stats["unknown_email_statuses"]:
        logging.info(
            "Valeurs d'Email Status hors liste blanche (%s) rencontrées : %s",
            ", ".join(sorted(EMAIL_STATUS_WHITELIST)),
            ", ".join(sorted(stats["unknown_email_statuses"])),
        )
    else:
        logging.info("Valeurs d'Email Status hors liste blanche : aucune")
    logging.info("")
    logging.info("Exclusions par raison :")
    for reason, count in stats["excluded_by_reason"].items():
        logging.info("  - %-30s %d", reason, count)
    logging.info("")
    logging.info("Total exclu                        : %d", sum(stats["excluded_by_reason"].values()))
    logging.info("Prêt pour envoi (master)            : %d", stats["final_count"])
    logging.info("")
    logging.info("-> %s", master_path)
    logging.info("-> %s", excl_path)


if __name__ == "__main__":
    main()
