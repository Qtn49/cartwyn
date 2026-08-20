#!/usr/bin/env python3
"""Séquence de cold email Cartwyn — import, envoi progressif, suivi des réponses.

Envoie depuis `cartwyn.fr` — décision finale (voir règle 19 du CLAUDE.md et
prospection/README.md). Un domaine satellite (`cartwyn.online`) a été évalué
et écarté : pénalité structurelle et non corrigible sur les filtres
anti-spam à cause de son TLD (règles SpamAssassin `FROM_SUSPICIOUS_NTLD` et
`PDS_OTHER_BAD_TLD`), indépendante de toute configuration DNS — inutile d'y
revenir. Comme la réputation d'envoi est partagée avec le domaine de
production, ce script embarque deux garde-fous :
  - vérification blocklist (Spamhaus DBL) avant tout `--send`,
  - circuit-breaker automatique sur le taux de bounce/plaintes (interrogé via
    l'API Resend), qui pose une pause de sécurité persistante tant qu'elle
    n'est pas explicitement levée (`resume`).

Pensé pour être appelé périodiquement par une tâche cron sur le serveur de
production (pas un process qui tourne en continu) : à chaque exécution, il
regarde l'état de chaque contact en base et envoie ce qui est dû, rien de
plus.

Sous-commandes :
    import --file master-{date}.csv
        Charge de nouveaux contacts dans l'état local (ne touche jamais un
        contact déjà connu, pour ne pas relancer sa progression).

    run [--send] [--limit N]
        Vérifie la pause de sécurité, les réponses reçues (IMAP), applique la
        liste de suppression, puis envoie (ou prévisualise) les emails dus
        dans la limite du palier de warmup du jour.
        SANS --send : mode aperçu, AUCUN appel à l'API Resend n'est fait.
        C'est le comportement par défaut, pas une option secondaire.
        AVEC --send : vérifie d'abord la blocklist Spamhaus DBL, le SPF/
        DKIM/DMARC du domaine d'envoi, et le circuit-breaker bounce/plaintes
        — abandon immédiat et sans envoi si l'un des trois échoue.

    test-send <email>
        Envoi de contrôle réel et unique (email 1, avec une vraie accroche
        prise dans master-*-enrichi.csv) vers une adresse donnée — pour
        vérifier concrètement le rendu/la délivrabilité, jamais pour de la
        vraie prospection. Ne touche à aucun état de séquence (pas de
        contact marqué contacté, ne compte pas dans le warmup). Vérifie
        quand même SPF/DKIM/DMARC et la blocklist avant d'envoyer.

    resume --reason "texte expliquant ce qui a été vérifié/corrigé"
        Seule façon de lever une pause de sécurité posée par le circuit-
        breaker. Le motif est obligatoire et journalisé.

    status
        Résumé de l'état de la séquence (comptes par statut/étape, pause de
        sécurité en cours le cas échéant).

Toute la configuration sensible (clé API Resend, domaine d'envoi, IMAP) vient
de variables d'environnement — voir prospection/.env.example.
"""

from __future__ import annotations

import argparse
import csv
import email as email_lib
import glob
import imaplib
import json
import logging
import os
import random
import sqlite3
import sys
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from email.header import decode_header
from email.utils import parseaddr, make_msgid

import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROSPECTION_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
TEMPLATES_DIR = os.path.join(PROSPECTION_DIR, "templates")
STATE_DIR = os.path.join(PROSPECTION_DIR, "state")
DB_PATH = os.path.join(STATE_DIR, "sequence.db")
CLEAN_DIR = os.path.join(PROSPECTION_DIR, "listes", "clean")

RESEND_API_BASE = "https://api.resend.com"

# --- Séquence -------------------------------------------------------------

STEPS = [1, 2, 3, 4]

# Délai aléatoire (en jours, borne incluse) après l'email PRÉCÉDENT, pas J0.
STEP_DELAY_DAYS = {
    2: (3, 4),
    3: (7, 8),
    4: (12, 14),
}

# Palier de warmup : liste de (jour_offset_depuis_le_premier_envoi, plafond/jour).
# Explicite et modifiable ici plutôt que codé en dur au plafond maximum dès le
# premier jour.
#
# Délibérément prudent : `cartwyn.fr` est le domaine de production, partagé
# avec le formulaire de contact et les échanges clients réels — départ plus
# bas, montée plus lente qu'un domaine satellite jetable (chaque palier
# ≤ 1,5x le précédent, étalée sur ~5 semaines, conforme aux recommandations
# générales de warmup vérifiées le 20/08/2026 — voir prospection/README.md).
WARMUP_SCHEDULE = [
    (0, 8),
    (5, 12),
    (10, 18),
    (15, 25),
    (21, 35),
    (28, 45),
    (35, 50),
]

# --- Fenêtre d'envoi -------------------------------------------------------
# N'envoyer réellement (--send) que sur ces jours/heures, heure de Paris —
# jours/horaires jugés les plus lus pour du cold email B2B. Configurable ici,
# pas codé en dur ailleurs. Ne s'applique qu'à `run --send` (une vague de
# prospection) : `test-send` reste utilisable à tout moment (envoi de
# contrôle manuel et volontaire, pas une vague), voir prospection/README.md.
SENDING_TIMEZONE = ZoneInfo("Europe/Paris")
SENDING_WEEKDAYS = {1, 2, 3}  # 0=lundi ... 6=dimanche -> mardi, mercredi, jeudi
SENDING_TIME_RANGES = [
    (time(9, 30), time(11, 0)),
    (time(14, 0), time(15, 0)),
]


def within_sending_window(now: datetime | None = None) -> bool:
    local = (now or datetime.now(timezone.utc)).astimezone(SENDING_TIMEZONE)
    if local.weekday() not in SENDING_WEEKDAYS:
        return False
    local_time = local.time()
    return any(start <= local_time <= end for start, end in SENDING_TIME_RANGES)


UNSUBSCRIBE_KEYWORDS = ["stop", "désinscri", "desinscri", "désabonne", "desabonne", "unsubscribe"]

# Mention de désabonnement courte plutôt que la phrase précédente : une
# adresse email en texte brut est automatiquement transformée en lien
# cliquable par la quasi-totalité des clients mail (Gmail inclus), pas
# besoin de HTML ni de phrase longue. Le header technique List-Unsubscribe
# (RFC 8058) reste inchangé par ailleurs, c'est un mécanisme séparé.
UNSUBSCRIBE_BODY_SUFFIX = "\n\nSe désinscrire : {unsubscribe_address}"

# --- Accroche déterministe (plus d'appel Haiku, voir prospection/README.md) ---
# Table construite à partir des valeurs de `category` réellement observées
# dans master-{date}.csv (StoreInspect) le 20/08/2026 : Beauty, Fashion,
# Home & Garden, Jewelry. À étendre au fur et à mesure que de nouvelles
# valeurs apparaissent dans de futurs exports — pas une liste exhaustive
# devinée à l'avance, volontairement.
CATEGORY_FR = {
    "beauty": "produits de beauté",
    "fashion": "vêtements",
    "home & garden": "décoration et jardin",
    "jewelry": "bijoux",
}

STORE_INTRO_WITH_CATEGORY = "J'ai vu que tu gérais une boutique de {category_fr} et ça a l'air de fonctionner super bien !"
STORE_INTRO_FALLBACK = "J'ai vu ta boutique {store_name} et ça a l'air de fonctionner super bien !"


def build_store_intro(store_name: str, category: str) -> tuple[str, bool]:
    """Retourne (texte, a_utilise_la_categorie). Jamais de mot anglais brut
    ni de trou dans la phrase : repli sur le nom de la boutique si la
    catégorie est absente ou non mappée."""
    category_fr = CATEGORY_FR.get(category.strip().lower())
    if category_fr:
        return STORE_INTRO_WITH_CATEGORY.format(category_fr=category_fr), True
    return STORE_INTRO_FALLBACK.format(store_name=store_name.strip()), False

# Nom affiché comme expéditeur. "Cartwyn" (marque) plutôt que "Quentin Guez"
# (personne) — décision du porteur du projet le 20/08/2026 après avoir vu
# les deux versions sur un envoi de test réel, compromis assumé en
# connaissance de cause : un nom de marque reste un signal plus fort vers le
# classement Promotions par Gmail qu'un nom de personne (voir
# prospection/README.md) — à ne pas rechanger sans qu'il le redemande.
# Reste modifiable ici et/ou via RESEND_FROM_NAME dans .env.
DEFAULT_FROM_NAME = "Cartwyn"

# --- Garde-fou anti-envoi-accidentel ---------------------------------------
# Incident du 20/08/2026 : un script de diagnostic ad hoc (pas un fichier de
# test versionné, juste une commande ponctuelle) a directement appelé
# cmd_run() avec args.send=True sur l'état réel contenant de vrais
# prospects, et un email est réellement parti. --send seul est trop facile à
# passer par erreur/habitude dans un script rapide. Ce deuxième flag,
# volontairement long et explicite, doit être tapé EN TOUTES LETTRES pour
# qu'un envoi réel parte — bien plus dur à ajouter par réflexe qu'un simple
# --send. Aucun script de test ne doit jamais le passer ; voir
# prospection/README.md pour la règle complète sur comment tester le chemin
# d'envoi sans risque (DB isolée, contact factice à domaine réservé,
# send_via_resend_api mocké).
REAL_SEND_CONFIRMATION_FLAG = "--i-understand-this-sends-real-email"

# --- Circuit-breaker bounce/plaintes ---------------------------------------
# Seuils vérifiés le 20/08/2026 (pas inventés) :
#   - Resend exige lui-même un taux de bounce de compte < 4% et recommande un
#     taux de plainte < 0,08% (resend.com/docs/knowledge-base/account-quotas-
#     and-limits, resend.com/blog/four-ways-to-hurt-your-sender-reputation).
#   - Gmail/Yahoo/Microsoft appliquent un rejet permanent au-delà de 2% de
#     bounce et 0,3% de plainte (Google recommandant de rester sous 0,1%).
# On retient le plus strict des deux pour réagir AVANT d'atteindre le seuil
# d'application de l'un ou l'autre, pas après :
BOUNCE_RATE_THRESHOLD = 0.02       # 2% — seuil d'application Gmail/Yahoo/Microsoft
COMPLAINT_RATE_THRESHOLD = 0.0008  # 0,08% — seuil recommandé par Resend lui-même
CIRCUIT_BREAKER_MIN_SAMPLE = 20    # sous ce nombre d'envois trackés, pas assez de signal pour juger
CIRCUIT_BREAKER_WINDOW_DAYS = 14   # fenêtre glissante sur laquelle le taux est calculé

SPAMHAUS_DBL_ZONE = "dbl.spamhaus.org"


def env(name: str, default: str | None = None, required: bool = False) -> str | None:
    value = os.environ.get(name, default)
    if required and not value:
        logging.error("Variable d'environnement manquante : %s (voir prospection/.env.example)", name)
        sys.exit(1)
    return value


# --- État (SQLite) ---------------------------------------------------------
# SQLite plutôt que CSV pour cet état précis : plusieurs écritures
# read-modify-write par exécution (étape, statut, prochaine date) sur des
# centaines de contacts, potentiellement croisées avec la liste de
# suppression au même moment — un fichier CSV réécrit en entier à chaque run
# est plus fragile en cas d'interruption. Les listes-sources restent en CSV,
# ce n'est que l'état d'avancement de la séquence qui est en base.

SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
    email TEXT PRIMARY KEY,
    first_name TEXT,
    store_name TEXT,
    category TEXT,
    store_intro TEXT,
    is_generic INTEGER NOT NULL DEFAULT 0,
    domain TEXT,
    current_step INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    thread_message_id TEXT,
    thread_subject TEXT,
    next_send_at TEXT,
    imported_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS send_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    step INTEGER NOT NULL,
    sent_at TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT
);

CREATE TABLE IF NOT EXISTS suppression (
    email TEXT PRIMARY KEY,
    reason TEXT NOT NULL,
    added_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

# Colonnes ajoutées après la création initiale de send_log (suivi Resend pour
# le circuit-breaker) : migration légère, sans dépendance externe.
SEND_LOG_MIGRATIONS = [
    "ALTER TABLE send_log ADD COLUMN resend_email_id TEXT",
    "ALTER TABLE send_log ADD COLUMN last_event TEXT",
]


def get_db() -> sqlite3.Connection:
    os.makedirs(STATE_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    for statement in SEND_LOG_MIGRATIONS:
        try:
            conn.execute(statement)
        except sqlite3.OperationalError:
            pass  # colonne déjà présente
    conn.commit()
    return conn


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- Templates --------------------------------------------------------

def load_template(name: str) -> str:
    with open(os.path.join(TEMPLATES_DIR, name), "r", encoding="utf-8") as f:
        return f.read()


# Tirée au sort à chaque email réellement rendu (donc peut varier d'une
# étape à l'autre pour un même contact) — pas fixée par contact, plus simple
# à fusionner sans état supplémentaire. Bénéfice secondaire : un texte pas
# totalement identique d'un envoi à l'autre réduit aussi le risque qu'un
# volume de prospection avec une formulation quasi-identique soit repéré
# comme un pattern d'envoi de masse par les filtres.
SALUTATIONS = ["Hello,", "Salut,"]


def render(text: str, contact: sqlite3.Row) -> str:
    return (
        text.replace("{{salutation}}", random.choice(SALUTATIONS))
        .replace("{{first_name}}", contact["first_name"] or "")
        .replace("{{store_name}}", contact["store_name"] or "")
        .replace("{{category}}", contact["category"] or "")
        .replace("{{store_intro}}", contact["store_intro"] or "")
    )


def render_subject(contact: sqlite3.Row, step: int) -> str:
    base = render(load_template("subject.txt"), contact).strip()
    return base if step == 1 else f"Re: {base}"


def render_body(contact: sqlite3.Row, step: int, unsubscribe_address: str) -> str:
    raw = load_template(f"email-{step}.txt")
    body = render(raw, contact).rstrip("\n")
    body += UNSUBSCRIBE_BODY_SUFFIX.format(unsubscribe_address=unsubscribe_address)
    return body


# --- Import -----------------------------------------------------------

def cmd_import(args: argparse.Namespace) -> None:
    conn = get_db()
    inserted = skipped = 0
    with_category = fallback = 0
    with open(args.file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"contact_email", "first_name", "store_name", "category", "is_generic", "domain"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            logging.error("Colonnes manquantes dans %s : %s", args.file, ", ".join(sorted(missing)))
            sys.exit(1)
        for row in reader:
            email_addr = row["contact_email"].strip().lower()
            if not email_addr:
                continue
            existing = conn.execute("SELECT 1 FROM contacts WHERE email = ?", (email_addr,)).fetchone()
            if existing:
                skipped += 1
                continue
            store_intro, used_category = build_store_intro(row["store_name"], row["category"])
            if used_category:
                with_category += 1
            else:
                fallback += 1
            conn.execute(
                """INSERT INTO contacts
                   (email, first_name, store_name, category, store_intro, is_generic, domain,
                    current_step, status, next_send_at, imported_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, ?)""",
                (
                    email_addr, row["first_name"], row["store_name"], row["category"], store_intro,
                    1 if row["is_generic"].strip().lower() in ("true", "1", "yes") else 0,
                    row["domain"], now_iso(), now_iso(), now_iso(),
                ),
            )
            inserted += 1
    conn.commit()
    logging.info("Import terminé : %d nouveaux contacts, %d déjà connus (ignorés).", inserted, skipped)
    logging.info(
        "Accroche déterministe : %d avec catégorie mappée, %d en repli (nom de boutique seul).",
        with_category, fallback,
    )


# --- Warmup / planification ---------------------------------------------

def get_first_send_date(conn: sqlite3.Connection) -> datetime | None:
    row = conn.execute("SELECT value FROM meta WHERE key = 'first_send_at'").fetchone()
    return datetime.fromisoformat(row["value"]) if row else None


def daily_cap_for(conn: sqlite3.Connection, today: datetime) -> int:
    first_send = get_first_send_date(conn)
    if first_send is None:
        return WARMUP_SCHEDULE[0][1]
    day_offset = (today.date() - first_send.date()).days
    cap = WARMUP_SCHEDULE[0][1]
    for offset, value in WARMUP_SCHEDULE:
        if day_offset >= offset:
            cap = value
    return cap


def sent_today_count(conn: sqlite3.Connection, today: datetime) -> int:
    day_str = today.date().isoformat()
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM send_log WHERE status = 'sent' AND substr(sent_at, 1, 10) = ?",
        (day_str,),
    ).fetchone()
    return row["n"]


def schedule_next(step_just_sent: int) -> tuple[int | None, str | None]:
    next_step = step_just_sent + 1
    if next_step > STEPS[-1]:
        return None, None
    lo, hi = STEP_DELAY_DAYS[next_step]
    delay_days = random.uniform(lo, hi)
    next_at = datetime.now(timezone.utc) + timedelta(days=delay_days)
    return next_step, next_at.isoformat()


# --- Liste de suppression -------------------------------------------------

def is_suppressed(conn: sqlite3.Connection, email_addr: str) -> bool:
    return conn.execute("SELECT 1 FROM suppression WHERE email = ?", (email_addr.lower(),)).fetchone() is not None


def suppress(conn: sqlite3.Connection, email_addr: str, reason: str) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO suppression (email, reason, added_at) VALUES (?, ?, ?)",
        (email_addr.lower(), reason, now_iso()),
    )
    conn.execute(
        "UPDATE contacts SET status = 'unsubscribed', updated_at = ? WHERE email = ?",
        (now_iso(), email_addr.lower()),
    )


def decode_mime_str(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    return "".join(
        (part.decode(enc or "utf-8", errors="ignore") if isinstance(part, bytes) else part)
        for part, enc in parts
    )


def check_replies(conn: sqlite3.Connection) -> None:
    host = env("IMAP_HOST")
    if not host:
        logging.info("IMAP non configuré (IMAP_HOST absent) — vérification des réponses ignorée.")
        return
    port = int(env("IMAP_PORT", "993"))
    user = env("IMAP_USER", required=True)
    password = env("IMAP_PASSWORD", required=True)
    folder = env("IMAP_FOLDER", "INBOX")

    try:
        imap = imaplib.IMAP4_SSL(host, port)
        imap.login(user, password)
        imap.select(folder)
        status, data = imap.search(None, "UNSEEN")
        if status != "OK":
            logging.warning("Recherche IMAP échouée : %s", status)
            return
        uids = data[0].split()
        logging.info("Réponses non lues à traiter : %d", len(uids))
        for uid in uids:
            status, msg_data = imap.fetch(uid, "(RFC822)")
            if status != "OK" or not msg_data or not msg_data[0]:
                continue
            raw = msg_data[0][1]
            msg = email_lib.message_from_bytes(raw)
            _, from_addr = parseaddr(msg.get("From", ""))
            from_addr = from_addr.lower()

            contact = conn.execute("SELECT * FROM contacts WHERE email = ?", (from_addr,)).fetchone()
            if contact and contact["status"] == "active":
                subject = decode_mime_str(msg.get("Subject", ""))
                body_text = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body_text += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="ignore")
                else:
                    payload = msg.get_payload(decode=True)
                    if payload:
                        body_text = payload.decode(msg.get_content_charset() or "utf-8", errors="ignore")

                haystack = (subject + " " + body_text).lower()
                if any(kw in haystack for kw in UNSUBSCRIBE_KEYWORDS):
                    suppress(conn, from_addr, "unsubscribe_keyword")
                    logging.info("Désabonnement détecté : %s", from_addr)
                else:
                    conn.execute(
                        "UPDATE contacts SET status = 'replied', next_send_at = NULL, updated_at = ? WHERE email = ?",
                        (now_iso(), from_addr),
                    )
                    logging.info("Réponse détectée, séquence stoppée : %s", from_addr)

            imap.store(uid, "+FLAGS", "\\Seen")
        conn.commit()
        imap.close()
        imap.logout()
    except Exception as exc:
        logging.warning("Vérification IMAP impossible : %s", exc)


# --- Vérification DNS SPF/DKIM/DMARC --------------------------------------
#
# Toutes les requêtes DNS de ce module passent par un résolveur public
# explicite (Cloudflare puis Google en repli) plutôt que le résolveur système
# par défaut. Constaté en pratique le 20/08/2026 : après correction d'un
# enregistrement DNS chez Hostinger, le résolveur système d'une machine de
# dev pouvait encore répondre avec l'ancienne valeur en cache (TTL local)
# largement après que les résolveurs publics avaient la version à jour —
# risque de faux négatif ("DNS pas encore bon") sur un check qui doit rester
# fiable. Les résolveurs publics ont un cache généralement plus à jour et
# plus représentatif de ce que verront les serveurs de messagerie receveurs.

PUBLIC_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"]


def _public_resolver():
    import dns.resolver
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = PUBLIC_DNS_SERVERS
    return resolver


def _txt_records(name: str) -> list[str]:
    resolver = _public_resolver()
    try:
        answers = resolver.resolve(name, "TXT")
        return ["".join(r.decode() if isinstance(r, bytes) else r for r in rec.strings) for rec in answers]
    except Exception:
        return []


def check_domain_auth(sending_domain: str, dkim_selector: str, root_domain: str) -> bool:
    """SPF est vérifié sur `sending_domain`, DKIM et DMARC sur `root_domain`.
    Sur `cartwyn.fr`, Resend publie SPF/DKIM/DMARC directement sur le domaine
    de production (pas de sous-domaine technique séparé), donc les deux
    valeurs sont en pratique identiques (`cartwyn.fr`) — voir
    prospection/.env.example. Le paramètre reste séparé en deux plutôt que
    fusionné en un seul, par prudence : rien ne garantit que ça reste vrai si
    la configuration Resend change un jour (ça ne l'était pas pour l'essai
    précédent sur `cartwyn.online`, où SPF et DKIM vivaient sur deux DNS
    différents)."""
    try:
        import dns.resolver  # noqa: F401
    except ImportError:
        logging.error(
            "Le paquet 'dnspython' n'est pas installé. "
            "Installez les dépendances : pip3 install -r prospection/scripts/requirements.txt"
        )
        return False

    ok = True

    spf = [r for r in _txt_records(sending_domain) if r.startswith("v=spf1")]
    if not spf:
        logging.error("SPF absent pour %s (pas d'enregistrement TXT 'v=spf1...').", sending_domain)
        ok = False
    else:
        logging.info("SPF trouvé pour %s : %s", sending_domain, spf[0])

    dkim_name = f"{dkim_selector}._domainkey.{root_domain}"
    dkim = _txt_records(dkim_name)
    if not dkim:
        logging.error("DKIM absent : aucun enregistrement TXT sur %s.", dkim_name)
        ok = False
    else:
        logging.info("DKIM trouvé sur %s.", dkim_name)

    dmarc_name = f"_dmarc.{root_domain}"
    dmarc = [r for r in _txt_records(dmarc_name) if r.startswith("v=DMARC1")]
    if not dmarc:
        logging.error("DMARC absent pour %s (pas d'enregistrement TXT 'v=DMARC1...' sur %s).", root_domain, dmarc_name)
        ok = False
    elif len(dmarc) > 1:
        # Un domaine ne doit avoir qu'UN SEUL enregistrement _dmarc — plusieurs
        # en parallèle invalident la vérification DMARC pour les receveurs
        # (comportement indéfini/échec selon les implémentations), même si
        # chacun pris isolément a l'air valide.
        logging.error(
            "DMARC INVALIDE pour %s : %d enregistrements TXT trouvés sur %s (il ne doit y en avoir qu'UN SEUL) : %s",
            root_domain, len(dmarc), dmarc_name, " | ".join(dmarc),
        )
        ok = False
    else:
        logging.info("DMARC trouvé pour %s : %s", root_domain, dmarc[0])

    return ok


# --- Vérification blocklist (Spamhaus DBL) ---------------------------------

def check_spamhaus_dbl(domain: str) -> bool:
    """True = domaine propre (pas listé). False = listé OU vérification impossible.

    Fail-closed : une erreur DNS autre qu'un NXDOMAIN propre (timeout, panne
    du résolveur...) bloque l'envoi plutôt que de laisser passer sans
    garantie — cohérent avec « ne jamais envoyer quand même ».

    Résolveur SYSTÈME par défaut ici, volontairement pas `_public_resolver()`
    (Cloudflare/Google) utilisé pour SPF/DKIM/DMARC : Spamhaus bloque
    explicitement les requêtes de son DNSBL gratuit relayées via de gros
    résolveurs publics partagés (retour d'erreur 127.255.255.254, "blocked
    due to Spamhaus Policy" — constaté en pratique le 20/08/2026, PAS une
    vraie mise en liste). Interroger son propre résolveur récursif est le
    fonctionnement documenté et attendu du DNSBL gratuit.
    """
    try:
        import dns.resolver
    except ImportError:
        logging.error(
            "Le paquet 'dnspython' n'est pas installé. "
            "Installez les dépendances : pip3 install -r prospection/scripts/requirements.txt"
        )
        return False

    query = f"{domain}.{SPAMHAUS_DBL_ZONE}"
    try:
        answers = dns.resolver.resolve(query, "A")
        codes = [a.to_text() for a in answers]
        # Toute réponse en 127.255.255.0/24 est un code d'erreur Spamhaus
        # (requête invalide, résolveur bloqué...), PAS une mise en liste
        # réelle — les vraies listes DBL répondent en 127.0.1.x. Distinguer
        # les deux pour ne jamais annoncer à tort un domaine blacklisté.
        error_codes = [c for c in codes if c.startswith("127.255.255.")]
        if error_codes and len(error_codes) == len(codes):
            logging.error(
                "Vérification Spamhaus DBL impossible pour %s : réponse d'erreur %s "
                "(pas une mise en liste — probablement un résolveur non autorisé pour le DNSBL "
                "gratuit ; le résolveur système doit interroger directement, sans relais public "
                "type 1.1.1.1/8.8.8.8) — envoi bloqué par prudence, à re-tester.",
                domain, ", ".join(error_codes),
            )
            return False
        logging.error("Domaine %s LISTÉ sur Spamhaus DBL (%s) — %s", domain, query, ", ".join(codes))
        return False
    except dns.resolver.NXDOMAIN:
        logging.info("Spamhaus DBL : %s n'est pas listé.", domain)
        return True
    except Exception as exc:
        logging.error("Vérification Spamhaus DBL impossible pour %s : %s — envoi bloqué par prudence.", domain, exc)
        return False


# --- Circuit-breaker bounce/plaintes (API Resend) --------------------------

def get_safety_pause(conn: sqlite3.Connection) -> dict | None:
    row = conn.execute("SELECT value FROM meta WHERE key = 'safety_pause'").fetchone()
    return json.loads(row["value"]) if row else None


def set_safety_pause(conn: sqlite3.Connection, reason: str, details: dict) -> None:
    payload = {"reason": reason, "tripped_at": now_iso(), **details}
    conn.execute(
        "INSERT INTO meta (key, value) VALUES ('safety_pause', ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (json.dumps(payload),),
    )
    conn.commit()


def clear_safety_pause(conn: sqlite3.Connection, cleared_reason: str) -> None:
    conn.execute("DELETE FROM meta WHERE key = 'safety_pause'")
    conn.execute(
        "INSERT INTO meta (key, value) VALUES ('safety_pause_last_clear', ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (json.dumps({"cleared_at": now_iso(), "reason": cleared_reason}),),
    )
    conn.commit()


def poll_resend_email_status(api_key: str, resend_email_id: str) -> str | None:
    try:
        resp = requests.get(
            f"{RESEND_API_BASE}/emails/{resend_email_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        return resp.json().get("last_event")
    except requests.RequestException:
        return None


def refresh_send_log_events(conn: sqlite3.Connection, api_key: str, window_start_iso: str) -> None:
    """Repolle le statut Resend de chaque envoi trackable dans la fenêtre."""
    rows = conn.execute(
        "SELECT id, resend_email_id FROM send_log "
        "WHERE status = 'sent' AND sent_at >= ? AND resend_email_id IS NOT NULL",
        (window_start_iso,),
    ).fetchall()
    for row in rows:
        last_event = poll_resend_email_status(api_key, row["resend_email_id"])
        if last_event:
            conn.execute("UPDATE send_log SET last_event = ? WHERE id = ?", (last_event, row["id"]))
    conn.commit()


def check_circuit_breaker(conn: sqlite3.Connection, api_key: str) -> bool:
    """True = OK pour continuer à envoyer. False = circuit-breaker déclenché
    (la pause de sécurité est posée avant de retourner False)."""
    window_start = (datetime.now(timezone.utc) - timedelta(days=CIRCUIT_BREAKER_WINDOW_DAYS)).isoformat()

    refresh_send_log_events(conn, api_key, window_start)

    rows = conn.execute(
        "SELECT last_event FROM send_log WHERE status = 'sent' AND sent_at >= ? AND resend_email_id IS NOT NULL",
        (window_start,),
    ).fetchall()
    sample_size = len(rows)

    if sample_size < CIRCUIT_BREAKER_MIN_SAMPLE:
        logging.info(
            "Circuit-breaker : échantillon trop petit pour juger (%d envois trackés sur %d jours, seuil %d) — envoi autorisé.",
            sample_size, CIRCUIT_BREAKER_WINDOW_DAYS, CIRCUIT_BREAKER_MIN_SAMPLE,
        )
        return True

    bounced = sum(1 for r in rows if r["last_event"] == "bounced")
    complained = sum(1 for r in rows if r["last_event"] == "complained")
    bounce_rate = bounced / sample_size
    complaint_rate = complained / sample_size

    logging.info(
        "Circuit-breaker : %d envois trackés sur %d jours — bounce %.2f%% (seuil %.2f%%), plainte %.3f%% (seuil %.3f%%)",
        sample_size, CIRCUIT_BREAKER_WINDOW_DAYS,
        bounce_rate * 100, BOUNCE_RATE_THRESHOLD * 100,
        complaint_rate * 100, COMPLAINT_RATE_THRESHOLD * 100,
    )

    if bounce_rate >= BOUNCE_RATE_THRESHOLD or complaint_rate >= COMPLAINT_RATE_THRESHOLD:
        reason_bits = []
        if bounce_rate >= BOUNCE_RATE_THRESHOLD:
            reason_bits.append(f"taux de bounce {bounce_rate*100:.2f}% >= seuil {BOUNCE_RATE_THRESHOLD*100:.2f}%")
        if complaint_rate >= COMPLAINT_RATE_THRESHOLD:
            reason_bits.append(f"taux de plainte {complaint_rate*100:.3f}% >= seuil {COMPLAINT_RATE_THRESHOLD*100:.3f}%")
        reason = " et ".join(reason_bits)
        set_safety_pause(
            conn, reason,
            {"sample_size": sample_size, "bounce_rate": bounce_rate, "complaint_rate": complaint_rate,
             "window_days": CIRCUIT_BREAKER_WINDOW_DAYS},
        )
        logging.error("CIRCUIT-BREAKER DÉCLENCHÉ : %s. Envoi arrêté, pause de sécurité posée.", reason)
        return False

    return True


# --- Envoi (API Resend) ----------------------------------------------------

def send_via_resend_api(
    api_key: str, from_addr: str, from_name: str, to_addr: str, subject: str, body: str,
    unsubscribe_address: str, message_id: str, in_reply_to: str | None,
) -> str:
    """Envoie via l'API HTTP Resend (pas le relais SMTP) : c'est le seul mode
    qui renvoie un id exploitable pour repoller le statut bounce/plainte
    ensuite (le relais SMTP générique ne le permet pas) — nécessaire au
    circuit-breaker."""
    headers = {
        "Message-ID": message_id,
        "List-Unsubscribe": f"<mailto:{unsubscribe_address}?subject=STOP>",
    }
    if in_reply_to:
        headers["In-Reply-To"] = in_reply_to
        headers["References"] = in_reply_to

    resp = requests.post(
        f"{RESEND_API_BASE}/emails",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "from": f"{from_name} <{from_addr}>",
            "to": [to_addr],
            "subject": subject,
            "text": body,
            "headers": headers,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def cmd_run(args: argparse.Namespace) -> None:
    if args.send and not getattr(args, "confirmed_real_send", False):
        logging.error(
            "--send sans %s : refusé. Un envoi réel exige les deux flags explicitement "
            "(garde-fou anti-envoi-accidentel, voir prospection/README.md).",
            REAL_SEND_CONFIRMATION_FLAG,
        )
        sys.exit(1)

    conn = get_db()

    pause = get_safety_pause(conn)
    if pause:
        logging.error("=" * 70)
        logging.error("PAUSE_SECURITE ACTIVE — aucun envoi, aucun aperçu tant qu'elle n'est pas levée.")
        logging.error("Raison : %s", pause.get("reason"))
        logging.error("Déclenchée le : %s", pause.get("tripped_at"))
        if "bounce_rate" in pause:
            logging.error(
                "Détail : %d envois trackés, bounce %.2f%%, plainte %.3f%%",
                pause.get("sample_size", 0), pause.get("bounce_rate", 0) * 100, pause.get("complaint_rate", 0) * 100,
            )
        logging.error("Pour lever : python3 send_sequence.py resume --reason \"...\"")
        logging.error("=" * 70)
        sys.exit(1)

    check_replies(conn)

    if args.send and not within_sending_window():
        now_paris = datetime.now(timezone.utc).astimezone(SENDING_TIMEZONE)
        logging.info(
            "Hors fenêtre d'envoi (%s, %s) — rien n'est envoyé sur ce run, on attend le prochain créneau valide.",
            now_paris.strftime("%A %d/%m %H:%M"), SENDING_TIMEZONE,
        )
        return

    api_key = env("RESEND_API_KEY", required=args.send)
    from_addr = env("RESEND_FROM_EMAIL", required=args.send)
    from_name = env("RESEND_FROM_NAME", DEFAULT_FROM_NAME)
    # SENDING_DOMAIN (SPF) et ROOT_DOMAIN (DKIM, DMARC, Spamhaus DBL) : sur
    # cartwyn.fr les deux valent la même chose (`cartwyn.fr`), Resend n'y
    # utilise pas de sous-domaine technique séparé. Gardés distincts dans le
    # code par prudence — voir check_domain_auth() et .env.example.
    sending_domain = env("SENDING_DOMAIN", required=args.send)
    root_domain = env("ROOT_DOMAIN", required=args.send)
    dkim_selector = env("DKIM_SELECTOR", "resend")
    unsubscribe_address = env("UNSUBSCRIBE_ADDRESS") or (f"unsubscribe@{root_domain}" if root_domain else "unsubscribe@example.invalid")

    if args.send:
        if not check_spamhaus_dbl(root_domain):
            logging.error("Vérification blocklist échouée pour %s. Envoi annulé, rien n'est parti.", root_domain)
            sys.exit(1)

        if not check_domain_auth(sending_domain, dkim_selector, root_domain):
            logging.error(
                "SPF/DKIM (%s) ou DMARC (%s) non conformes. Envoi annulé — corrigez les enregistrements DNS "
                "avant de relancer avec --send.", sending_domain, root_domain,
            )
            sys.exit(1)

        if not check_circuit_breaker(conn, api_key):
            sys.exit(1)

    today = datetime.now(timezone.utc)
    cap = daily_cap_for(conn, today)
    already_sent = sent_today_count(conn, today)
    remaining = max(0, cap - already_sent)
    if args.limit is not None:
        remaining = min(remaining, args.limit)

    logging.info(
        "Palier warmup du jour : %d/jour — déjà envoyés aujourd'hui : %d — quota restant : %d",
        cap, already_sent, remaining,
    )

    if remaining <= 0:
        logging.info("Quota du jour atteint, rien à envoyer sur ce run.")
        return

    due = conn.execute(
        """SELECT * FROM contacts
           WHERE status = 'active' AND next_send_at IS NOT NULL AND next_send_at <= ?
           ORDER BY next_send_at ASC LIMIT ?""",
        (today.isoformat(), remaining),
    ).fetchall()

    if not due:
        logging.info("Aucun contact dû pour un envoi sur ce run.")
        return

    mode = "ENVOI RÉEL" if args.send else "APERÇU (aucun appel à l'API Resend)"
    logging.info("--- %s : %d contact(s) à traiter ---", mode, len(due))

    for contact in due:
        if is_suppressed(conn, contact["email"]):
            conn.execute("UPDATE contacts SET status = 'unsubscribed', updated_at = ? WHERE email = ?", (now_iso(), contact["email"]))
            conn.commit()
            continue

        step = contact["current_step"] + 1
        subject = render_subject(contact, step)
        body = render_body(contact, step, unsubscribe_address)

        if not args.send:
            print("=" * 70)
            print(f"À : {contact['email']}  (étape {step}/4, boutique : {contact['store_name']})")
            print(f"Sujet : {subject}")
            print("-" * 70)
            print(body)
            print()
            continue

        message_id = make_msgid()

        try:
            resend_id = send_via_resend_api(
                api_key, from_addr, from_name, contact["email"], subject, body,
                unsubscribe_address, message_id,
                contact["thread_message_id"] if step > 1 else None,
            )
            sent_at = now_iso()
            next_step, next_send_at = schedule_next(step)
            conn.execute(
                """UPDATE contacts SET current_step = ?, status = ?, next_send_at = ?,
                   thread_message_id = COALESCE(thread_message_id, ?), thread_subject = COALESCE(thread_subject, ?),
                   updated_at = ? WHERE email = ?""",
                (
                    step, "active" if next_step else "done", next_send_at,
                    message_id, subject, now_iso(), contact["email"],
                ),
            )
            conn.execute(
                "INSERT INTO send_log (email, step, sent_at, status, detail, resend_email_id) VALUES (?, ?, ?, 'sent', NULL, ?)",
                (contact["email"], step, sent_at, resend_id),
            )
            if get_first_send_date(conn) is None:
                conn.execute("INSERT INTO meta (key, value) VALUES ('first_send_at', ?)", (sent_at,))
            conn.commit()
            logging.info("Envoyé : %s (étape %d/4, id Resend %s)", contact["email"], step, resend_id)
        except Exception as exc:
            conn.execute(
                "INSERT INTO send_log (email, step, sent_at, status, detail) VALUES (?, ?, ?, 'error', ?)",
                (contact["email"], step, now_iso(), str(exc)[:500]),
            )
            conn.commit()
            logging.error("Échec d'envoi pour %s (étape %d) : %s", contact["email"], step, exc)


DEMO_CONTACT = {
    "email": "demo@example.invalid",
    "first_name": "Alex",
    "store_name": "Ta Boutique",
    "category": "e-commerce",
    "store_intro": STORE_INTRO_FALLBACK.format(store_name="Ta Boutique"),
    "is_generic": False,
    "thread_message_id": None,
}


def load_test_contact() -> dict:
    """Un contact réel de master-{date}.csv (le premier du fichier), sinon le
    contact de démo — pour --test-send uniquement, jamais utilisé pour un
    vrai envoi de prospection. L'accroche est calculée à la volée avec la
    même logique déterministe que l'import (plus d'accroche pré-générée par
    Haiku à relire depuis un fichier enrichi, voir prospection/README.md)."""
    candidates = sorted(
        c for c in glob.glob(os.path.join(CLEAN_DIR, "master-*.csv")) if not c.endswith("-enrichi.csv")
    )
    if not candidates:
        logging.warning("Aucun master-*.csv trouvé — utilisation du contact de démo.")
        return DEMO_CONTACT

    with open(candidates[-1], newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            store_intro, _ = build_store_intro(row["store_name"], row["category"])
            return {
                "email": row["contact_email"],
                "first_name": row["first_name"],
                "store_name": row["store_name"],
                "category": row["category"],
                "store_intro": store_intro,
                "is_generic": row["is_generic"].strip().lower() in ("true", "1", "yes"),
                "thread_message_id": None,
            }

    logging.warning("Aucune ligne dans %s — utilisation du contact de démo.", candidates[-1])
    return DEMO_CONTACT


def cmd_test_send(args: argparse.Namespace) -> None:
    """Envoi de contrôle unique, hors séquence réelle : ne touche à aucune
    table de contacts/send_log, ne compte pas dans le warmup. Mêmes garde-fous
    de base qu'un envoi réel (SPF/DKIM/DMARC, blocklist), pas de circuit-
    breaker (il n'y a pas d'historique de CE envoi à évaluer) ni de plafond
    de warmup (un envoi de contrôle isolé, pas une vague de prospection)."""
    if not getattr(args, "confirmed_real_send", False):
        logging.error(
            "test-send exige %s (garde-fou anti-envoi-accidentel, voir prospection/README.md) — refusé.",
            REAL_SEND_CONFIRMATION_FLAG,
        )
        sys.exit(1)

    conn = get_db()
    pause = get_safety_pause(conn)
    if pause:
        logging.error("PAUSE_SECURITE active (%s) — --test-send refusé tant qu'elle n'est pas levée.", pause.get("reason"))
        sys.exit(1)

    api_key = env("RESEND_API_KEY", required=True)
    from_addr = env("RESEND_FROM_EMAIL", required=True)
    from_name = env("RESEND_FROM_NAME", DEFAULT_FROM_NAME)
    sending_domain = env("SENDING_DOMAIN", required=True)
    root_domain = env("ROOT_DOMAIN", required=True)
    dkim_selector = env("DKIM_SELECTOR", "resend")
    unsubscribe_address = env("UNSUBSCRIBE_ADDRESS") or from_addr

    if not check_spamhaus_dbl(root_domain):
        logging.error("Vérification blocklist échouée pour %s. Envoi de contrôle annulé.", root_domain)
        sys.exit(1)

    if not check_domain_auth(sending_domain, dkim_selector, root_domain):
        logging.error(
            "SPF/DKIM (%s) ou DMARC (%s) non conformes. Envoi de contrôle annulé.",
            sending_domain, root_domain,
        )
        sys.exit(1)

    contact = load_test_contact()
    subject = render_subject(contact, 1)
    body = render_body(contact, 1, unsubscribe_address)

    logging.info("Contact utilisé pour le rendu : %s (%s)", contact["store_name"], contact["email"])
    logging.info("From : %s <%s>", from_name, from_addr)
    logging.info("À : %s", args.email)
    logging.info("Sujet : %s", subject)
    logging.info("-" * 70)
    logging.info(body)
    logging.info("-" * 70)

    message_id = make_msgid()
    resend_id = send_via_resend_api(
        api_key, from_addr, from_name, args.email, subject, body,
        unsubscribe_address, message_id, None,
    )
    logging.info("Envoyé (contrôle, aucun état de séquence modifié). id Resend = %s", resend_id)


def cmd_resume(args: argparse.Namespace) -> None:
    conn = get_db()
    pause = get_safety_pause(conn)
    if not pause:
        logging.info("Aucune pause de sécurité en cours.")
        return
    clear_safety_pause(conn, args.reason)
    logging.info("Pause de sécurité levée. Motif enregistré : %s", args.reason)
    logging.info("Ancienne raison de la pause (pour mémoire) : %s", pause.get("reason"))


def cmd_status(args: argparse.Namespace) -> None:
    conn = get_db()
    pause = get_safety_pause(conn)
    if pause:
        logging.info("*** PAUSE_SECURITE ACTIVE *** : %s (depuis %s)", pause.get("reason"), pause.get("tripped_at"))
        logging.info("Lever avec : python3 send_sequence.py resume --reason \"...\"")
        logging.info("")
    logging.info("--- Statut de la séquence ---")
    for row in conn.execute("SELECT status, COUNT(*) AS n FROM contacts GROUP BY status ORDER BY status"):
        logging.info("  %-15s %d", row["status"], row["n"])
    logging.info("")
    logging.info("Par étape (contacts actifs, prochaine étape à envoyer) :")
    for row in conn.execute("SELECT current_step + 1 AS next_step, COUNT(*) AS n FROM contacts WHERE status = 'active' GROUP BY current_step ORDER BY next_step"):
        logging.info("  étape %d : %d contact(s) en attente", row["next_step"], row["n"])
    logging.info("")
    logging.info("Suppression list : %d adresse(s)", conn.execute("SELECT COUNT(*) AS n FROM suppression").fetchone()["n"])


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_import = sub.add_parser("import", help="Charger un master-*.csv dans l'état local")
    p_import.add_argument("--file", required=True)
    p_import.set_defaults(func=cmd_import)

    p_run = sub.add_parser("run", help="Envoyer (ou prévisualiser) ce qui est dû")
    p_run.add_argument("--send", action="store_true", help="Envoie réellement via l'API Resend. Sans ce flag : aperçu uniquement, aucun appel réseau d'envoi.")
    p_run.add_argument(
        REAL_SEND_CONFIRMATION_FLAG, dest="confirmed_real_send", action="store_true",
        help="Obligatoire EN PLUS de --send pour qu'un envoi réel parte. Garde-fou volontairement verbeux : "
             "aucun script de test ne doit jamais passer ce flag (voir prospection/README.md, incident du 20/08/2026).",
    )
    p_run.add_argument("--limit", type=int, default=None, help="Plafonner le nombre d'envois sur ce run (en plus du plafond warmup du jour)")
    p_run.set_defaults(func=cmd_run)

    p_test_send = sub.add_parser("test-send", help="Envoi de contrôle unique à une adresse donnée, hors séquence réelle")
    p_test_send.add_argument("email", help="Adresse de contrôle qui reçoit l'email (ex. votre propre adresse)")
    p_test_send.add_argument(
        REAL_SEND_CONFIRMATION_FLAG, dest="confirmed_real_send", action="store_true",
        help="Obligatoire pour que test-send envoie réellement — même garde-fou que pour run --send.",
    )
    p_test_send.set_defaults(func=cmd_test_send)

    p_resume = sub.add_parser("resume", help="Lever une pause de sécurité posée par le circuit-breaker")
    p_resume.add_argument("--reason", required=True, help="Ce qui a été vérifié/corrigé avant de reprendre (obligatoire, journalisé)")
    p_resume.set_defaults(func=cmd_resume)

    p_status = sub.add_parser("status", help="Résumé de l'état de la séquence")
    p_status.set_defaults(func=cmd_status)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
