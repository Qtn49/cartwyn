#!/usr/bin/env python3
"""Démontre concrètement les garanties de l'état SQLite de la séquence —
pas une affirmation, du code exécuté avec des assertions. Réutilise le
harnais sûr de test_send_path_safety.py (base isolée, réseau Resend mocké,
contacts fictifs sur domaines RFC 2606 réservés) et mocke aussi imaplib
pour tester check_replies() avec ses vraies règles de parsing/mots-clés,
sans jamais toucher un vrai serveur IMAP ni de vraies données.

Scénarios couverts :
1. Une réponse détectée arrête la séquence — aucune relance suivante.
2. Un désabonnement (mot-clé STOP) exclut définitivement le contact, y
   compris s'il réapparaît comme "nouveau" dans un futur import (le contrôle
   réel a lieu à l'envoi, pas à l'import — testé explicitement).
3. Les étapes partent dans l'ordre (jamais l'étape 3 avant la 2 pour un
   même contact), y compris après un redémarrage simulé (nouvelle connexion
   SQLite sur le même fichier).

Usage : python3 prospection/scripts/tests/test_state_machine.py
"""

from __future__ import annotations

import argparse
import email.utils
import os
import sqlite3
import sys
from datetime import datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SCRIPT_DIR))  # prospection/scripts/

import send_sequence as ss  # noqa: E402
from test_send_path_safety import (  # noqa: E402
    RESERVED_TEST_DOMAINS, isolated_db, mocked_network, set_env_defaults,
)


def seed_contact(conn, email_addr: str, current_step: int, status: str, next_send_at: str | None, **overrides) -> None:
    domain = email_addr.split("@", 1)[1]
    assert domain in RESERVED_TEST_DOMAINS, f"domaine de test non réservé : {domain}"
    fields = {
        "first_name": "Test", "store_name": "Boutique Test", "category": "Fashion",
        "store_intro": "intro test", "is_generic": 0, "domain": domain,
        "thread_message_id": None,
    }
    fields.update(overrides)
    conn.execute(
        """INSERT INTO contacts
           (email, first_name, store_name, category, store_intro, is_generic, domain,
            current_step, status, thread_message_id, next_send_at, imported_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            email_addr, fields["first_name"], fields["store_name"], fields["category"],
            fields["store_intro"], fields["is_generic"], fields["domain"], current_step, status,
            fields["thread_message_id"], next_send_at, ss.now_iso(), ss.now_iso(),
        ),
    )
    conn.commit()


def build_rfc822(from_addr: str, subject: str, body: str) -> bytes:
    msg = email.message.EmailMessage()
    msg["From"] = from_addr
    msg["To"] = "quentin@cartwyn.fr"
    msg["Subject"] = subject
    msg.set_content(body)
    return msg.as_bytes()


class FakeIMAP4SSL:
    """Remplace imaplib.IMAP4_SSL : sert des messages fabriqués en mémoire,
    aucune connexion réseau. Reproduit juste assez de l'API IMAP réelle
    pour que check_replies() (code de production, non modifié) tourne
    normalement dessus."""

    inbox: list[bytes] = []  # défini par chaque test avant l'appel

    def __init__(self, host, port):
        pass

    def login(self, user, password):
        return "OK", [b"logged in"]

    def select(self, folder):
        return "OK", [str(len(self.inbox)).encode()]

    def search(self, charset, criteria):
        assert criteria == "UNSEEN"
        ids = b" ".join(str(i + 1).encode() for i in range(len(self.inbox)))
        return "OK", [ids]

    def fetch(self, uid, spec):
        idx = int(uid) - 1
        raw = self.inbox[idx]
        return "OK", [(f"{uid} (RFC822 {{{len(raw)}}}".encode(), raw)]

    def store(self, uid, flag, value):
        return "OK", [b"done"]

    def close(self):
        pass

    def logout(self):
        pass


def with_fake_imap(messages: list[bytes]):
    FakeIMAP4SSL.inbox = messages
    original = ss.imaplib.IMAP4_SSL
    ss.imaplib.IMAP4_SSL = FakeIMAP4SSL
    os.environ["IMAP_HOST"] = "imap.test.invalid"
    os.environ["IMAP_USER"] = "quentin@cartwyn.fr"
    os.environ["IMAP_PASSWORD"] = "unused"
    return original


def restore_imap(original_class) -> None:
    """Symétrique de with_fake_imap : remet la vraie classe ET retire
    IMAP_HOST de l'environnement. Sans ce deuxième point, un test suivant
    qui ne configure pas l'IMAP mocké verrait quand même IMAP_HOST="imap.
    test.invalid" traîner (fuite entre tests) et tenterait une VRAIE
    résolution DNS sur ce nom réservé — inoffensif (échec réseau attrapé
    par check_replies()) mais faux et bruyant : corrigé ici plutôt que
    laissé trainer."""
    ss.imaplib.IMAP4_SSL = original_class
    os.environ.pop("IMAP_HOST", None)
    os.environ.pop("IMAP_USER", None)
    os.environ.pop("IMAP_PASSWORD", None)


def mocked_network_recording_success():
    """Variante de mocked_network() : enregistre l'appel mais RÉUSSIT (ne
    lève pas) — nécessaire pour les scénarios qui doivent vérifier la
    progression d'état après un envoi qui réussit, pas seulement l'absence
    d'appel. Toujours zéro vraie connexion réseau : send_via_resend_api est
    entièrement remplacée, le vrai `requests.post` n'est jamais atteint."""
    calls = []

    def fake(*args, **kwargs):
        calls.append((args, kwargs))
        return f"fake-resend-id-{len(calls)}"

    original = ss.send_via_resend_api
    ss.send_via_resend_api = fake
    return calls, original


# --- Scénario 1 : réponse détectée -> séquence arrêtée -----------------

def test_reply_stops_sequence():
    calls, original_send = mocked_network()
    original_imap = None
    try:
        set_env_defaults()
        conn = isolated_db()
        contact_email = "replied-contact@example.invalid"
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        seed_contact(conn, contact_email, current_step=1, status="active", next_send_at=past)

        # Une vraie réponse (pas de mot-clé de désabonnement) arrive.
        msg = build_rfc822(contact_email, "Re: Petite question pour Boutique Test", "Oui ça m'intéresse, dis-m'en plus !")
        original_imap = with_fake_imap([msg])

        ss.check_replies(conn)

        row = conn.execute("SELECT status, next_send_at FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["status"] == "replied", f"statut attendu 'replied', obtenu '{row['status']}'"
        assert row["next_send_at"] is None, "next_send_at doit être vidé pour stopper la planification"

        # La requête "due" réelle de cmd_run ne doit plus jamais le sélectionner.
        due = conn.execute(
            "SELECT * FROM contacts WHERE status = 'active' AND next_send_at IS NOT NULL AND next_send_at <= ?",
            (ss.now_iso(),),
        ).fetchall()
        assert contact_email not in [r["email"] for r in due], "le contact ne doit plus jamais être 'due'"
        assert len(calls) == 0, "aucun envoi réseau ne doit avoir eu lieu"
    finally:
        ss.send_via_resend_api = original_send
        if original_imap:
            restore_imap(original_imap)


# --- Scénario 2 : désabonnement -> exclusion définitive -----------------

def test_unsubscribe_keyword_excludes_forever():
    calls, original_send = mocked_network()
    original_imap = None
    try:
        set_env_defaults()
        conn = isolated_db()
        contact_email = "unsub-contact@example.invalid"
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        seed_contact(conn, contact_email, current_step=1, status="active", next_send_at=past)

        msg = build_rfc822(contact_email, "Re: Petite question pour Boutique Test", "STOP merci")
        original_imap = with_fake_imap([msg])
        ss.check_replies(conn)

        row = conn.execute("SELECT status FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["status"] == "unsubscribed"
        suppressed = conn.execute("SELECT 1 FROM suppression WHERE email = ?", (contact_email,)).fetchone()
        assert suppressed is not None, "doit être dans la table suppression"

        # Simule une future liste réimportée où ce même email réapparaît comme
        # "nouveau" contact actif (l'import ne consulte pas la suppression —
        # c'est le contrôle à l'ENVOI qui doit protéger, testé ici).
        conn.execute(
            """UPDATE contacts SET status = 'active', next_send_at = ?
               WHERE email = ?""",
            (past, contact_email),
        )
        conn.commit()

        assert ss.is_suppressed(conn, contact_email), "is_suppressed() doit le détecter malgré status='active'"

        # Passage réel par cmd_run (fenêtre ouverte, réseau mocké) : ne doit
        # jamais lui envoyer quoi que ce soit.
        ss.SENDING_WEEKDAYS = {0, 1, 2, 3, 4, 5, 6}
        from datetime import time as dtime
        ss.SENDING_TIME_RANGES = [(dtime(0, 0), dtime(23, 59))]
        args = argparse.Namespace(send=True, limit=5, confirmed_real_send=True)
        ss.cmd_run(args)

        assert len(calls) == 0, "un contact suppressed ne doit jamais recevoir d'envoi, même réimporté actif"
        row = conn.execute("SELECT status FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["status"] == "unsubscribed", "cmd_run doit re-corriger le statut vers unsubscribed"
    finally:
        ss.send_via_resend_api = original_send
        if original_imap:
            restore_imap(original_imap)
        ss.SENDING_WEEKDAYS = {1, 2, 3}


# --- Scénario 3 : ordre des étapes garanti, survit à un redémarrage -----

def test_step_order_and_restart_resilience():
    # Mock "succès enregistré", pas "toujours lever" : ce scénario doit
    # vérifier la progression d'état APRÈS un envoi qui réussit (current_step
    # incrémenté, next_send_at replanifié) — impossible à observer avec le
    # mock qui lève systématiquement (utile lui pour prouver "zéro appel").
    calls, original_send = mocked_network_recording_success()
    os.environ.pop("IMAP_HOST", None)  # pas d'IMAP mocké ici : doit être absent, pas fuité d'un test précédent
    try:
        set_env_defaults()
        conn = isolated_db()
        db_path = ss.DB_PATH  # pour rouvrir "après redémarrage"
        contact_email = "order-contact@example.invalid"

        # Actif à l'étape 1 (email 1 déjà envoyé), pas encore dû pour l'étape 2.
        future = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        seed_contact(conn, contact_email, current_step=1, status="active", next_send_at=future)

        from datetime import time as dtime
        ss.SENDING_WEEKDAYS = {0, 1, 2, 3, 4, 5, 6}
        ss.SENDING_TIME_RANGES = [(dtime(0, 0), dtime(23, 59))]
        args = argparse.Namespace(send=True, limit=5, confirmed_real_send=True)

        # Pas encore dû -> aucun envoi, current_step inchangé.
        ss.cmd_run(args)
        assert len(calls) == 0, "ne doit pas envoyer avant l'échéance"
        row = conn.execute("SELECT current_step FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["current_step"] == 1

        # L'échéance arrive : due pour l'étape 2.
        past = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
        conn.execute("UPDATE contacts SET next_send_at = ? WHERE email = ?", (past, contact_email))
        conn.commit()

        ss.cmd_run(args)
        assert len(calls) == 1, f"un seul envoi attendu (étape 2), {len(calls)} observé(s)"
        row = conn.execute("SELECT current_step, next_send_at FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["current_step"] == 2, f"étape 2 attendue, obtenu {row['current_step']}"
        assert row["next_send_at"] is not None and row["next_send_at"] > ss.now_iso(), \
            "la prochaine échéance (étape 3) doit être dans le futur"

        # Immédiatement après (même run juste rejoué) : pas encore dû pour
        # l'étape 3 -> aucun deuxième envoi, jamais l'étape 3 juste après la 2.
        ss.cmd_run(args)
        assert len(calls) == 1, "aucun envoi supplémentaire tant que l'étape 3 n'est pas due"

        # Redémarrage simulé : nouvelle connexion SQLite sur le même fichier
        # (équivalent d'un nouveau process cron), pas de connexion réutilisée.
        conn.close()
        conn2 = sqlite3.connect(db_path)
        conn2.row_factory = sqlite3.Row
        row = conn2.execute("SELECT current_step FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["current_step"] == 2, "l'état doit survivre à une nouvelle connexion (redémarrage)"

        # Après redémarrage, si l'étape 3 devient due, elle part bien après
        # la 2 (jamais avant), jamais deux étapes d'un coup.
        conn2.execute("UPDATE contacts SET next_send_at = ? WHERE email = ?", (past, contact_email))
        conn2.commit()
        ss.cmd_run(args)
        assert len(calls) == 2, "l'étape 3 doit partir après redémarrage, une seule fois"
        row = conn2.execute("SELECT current_step FROM contacts WHERE email = ?", (contact_email,)).fetchone()
        assert row["current_step"] == 3, f"étape 3 attendue après redémarrage, obtenu {row['current_step']}"
    finally:
        ss.send_via_resend_api = original_send
        ss.SENDING_WEEKDAYS = {1, 2, 3}


TESTS = [
    test_reply_stops_sequence,
    test_unsubscribe_keyword_excludes_forever,
    test_step_order_and_restart_resilience,
]


def main() -> None:
    failures = 0
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"OK   {name}")
        except Exception as exc:  # noqa: BLE001
            failures += 1
            print(f"FAIL {name} : {exc}")
    print()
    if failures:
        print(f"{failures} test(s) en échec.")
        sys.exit(1)
    print(f"{len(TESTS)} test(s) OK — garanties de l'état SQLite démontrées sans aucune vraie donnée.")


if __name__ == "__main__":
    main()
