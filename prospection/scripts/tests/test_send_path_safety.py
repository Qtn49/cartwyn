#!/usr/bin/env python3
"""Test du chemin d'envoi (fenêtre, warmup, garde-fous) SANS jamais pouvoir
faire un vrai appel réseau ni toucher un vrai contact.

Existe suite à un incident réel (20/08/2026) : un script de diagnostic ad
hoc a appelé cmd_run() directement sur l'état de production avec de vrais
prospects importés, et deux emails sont réellement partis. Ce fichier fixe
le seul pattern à utiliser pour tester le chemin d'envoi désormais :

1. DB isolée (jamais prospection/state/sequence.db) — voir `isolated_db()`.
2. `send_via_resend_api` remplacée par un espion qui n'ouvre AUCUNE
   connexion réseau — voir `mocked_network()`.
3. Contact fabriqué sur un domaine RFC 2606 réservé (`example.com`,
   `example.invalid`...), qui ne peut physiquement pas correspondre à un
   vrai prospect de `master-{date}.csv` — voir `FAKE_CONTACT`. Vérifié
   explicitement par `test_fake_contact_domain_is_reserved()`.

Usage :
    python3 prospection/scripts/tests/test_send_path_safety.py
Sort avec un code non-nul si un test échoue. Pas de framework externe
(pas de dépendance ajoutée juste pour les tests).
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
from datetime import time as dtime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SCRIPT_DIR))  # prospection/scripts/

import send_sequence as ss  # noqa: E402

# RFC 2606 : domaines réservés pour la documentation/les tests, ne seront
# jamais délégués à un vrai enregistrant — ne peuvent jamais être un vrai
# prospect StoreInspect.
RESERVED_TEST_DOMAINS = {"example.com", "example.net", "example.org", "example.invalid"}

FAKE_CONTACT_EMAIL = "audit-test@example.invalid"

FAKE_CONTACT = {
    "email": FAKE_CONTACT_EMAIL,
    "first_name": "Test",
    "store_name": "Boutique Test",
    "category": "Fashion",
    "store_intro": "intro de test",
    "is_generic": 0,
    "domain": "example.invalid",
}


class NetworkCallAttempted(AssertionError):
    pass


def mocked_network():
    """Remplace send_via_resend_api par un espion qui lève au lieu
    d'ouvrir une connexion — toute tentative d'appel réseau fait échouer
    le test au lieu de partir en vrai."""
    calls = []

    def fake(*args, **kwargs):
        calls.append((args, kwargs))
        raise NetworkCallAttempted(
            "send_via_resend_api appelée pendant un test — ne doit JAMAIS arriver, "
            "même en cas de bug dans le code testé."
        )

    original = ss.send_via_resend_api
    ss.send_via_resend_api = fake
    return calls, original


def isolated_db():
    """DB SQLite temporaire, jamais prospection/state/sequence.db."""
    tmp_dir = tempfile.mkdtemp(prefix="cartwyn-prospection-test-")
    ss.STATE_DIR = tmp_dir
    ss.DB_PATH = os.path.join(tmp_dir, "sequence.db")
    return ss.get_db()


def seed_fake_contact(conn, next_send_at: str) -> None:
    conn.execute(
        """INSERT INTO contacts
           (email, first_name, store_name, category, store_intro, is_generic, domain,
            current_step, status, next_send_at, imported_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, ?)""",
        (
            FAKE_CONTACT["email"], FAKE_CONTACT["first_name"], FAKE_CONTACT["store_name"],
            FAKE_CONTACT["category"], FAKE_CONTACT["store_intro"], FAKE_CONTACT["is_generic"],
            FAKE_CONTACT["domain"], next_send_at, ss.now_iso(), ss.now_iso(),
        ),
    )
    conn.commit()


def set_env_defaults():
    os.environ.setdefault("RESEND_API_KEY", "test-key-unused")
    os.environ.setdefault("RESEND_FROM_EMAIL", "quentin@cartwyn.fr")
    os.environ.setdefault("SENDING_DOMAIN", "cartwyn.fr")
    os.environ.setdefault("ROOT_DOMAIN", "cartwyn.fr")


# --- Tests ------------------------------------------------------------

def test_fake_contact_domain_is_reserved():
    domain = FAKE_CONTACT_EMAIL.split("@", 1)[1]
    assert domain in RESERVED_TEST_DOMAINS, (
        f"Le domaine de test '{domain}' n'est PAS dans la liste des domaines réservés RFC 2606 "
        f"— il pourrait par accident correspondre à un vrai prospect. Ne jamais utiliser un vrai "
        f"domaine (ex. gmail.com, ekstyling.com...) pour un contact de test."
    )


def test_confirmation_flag_required_for_run_send():
    calls, original = mocked_network()
    try:
        isolated_db()
        args = argparse.Namespace(send=True, limit=1, confirmed_real_send=False)
        try:
            ss.cmd_run(args)
        except SystemExit as exc:
            assert exc.code != 0, "cmd_run(--send sans confirmation) doit sortir en erreur"
        else:
            raise AssertionError("cmd_run(--send sans confirmation) n'a pas levé SystemExit")
        assert len(calls) == 0, "Aucun appel réseau ne doit avoir eu lieu"
    finally:
        ss.send_via_resend_api = original


def test_outside_window_never_calls_network_even_with_confirmation():
    calls, original = mocked_network()
    try:
        set_env_defaults()
        conn = isolated_db()
        seed_fake_contact(conn, ss.now_iso())
        ss.SENDING_WEEKDAYS = set()  # aucun jour valide -> toujours hors fenêtre
        args = argparse.Namespace(send=True, limit=1, confirmed_real_send=True)
        ss.cmd_run(args)
        assert len(calls) == 0, "Hors fenêtre : aucun appel réseau ne doit avoir lieu, même avec confirmation"
        row = conn.execute("SELECT current_step FROM contacts WHERE email = ?", (FAKE_CONTACT_EMAIL,)).fetchone()
        assert row["current_step"] == 0, "Le contact ne doit pas avoir progressé"
    finally:
        ss.send_via_resend_api = original
        ss.SENDING_WEEKDAYS = {1, 2, 3}


def test_inside_window_calls_network_exactly_once_for_fake_contact_only():
    calls, original = mocked_network()
    try:
        set_env_defaults()
        conn = isolated_db()
        seed_fake_contact(conn, ss.now_iso())
        ss.SENDING_WEEKDAYS = {0, 1, 2, 3, 4, 5, 6}
        ss.SENDING_TIME_RANGES = [(dtime(0, 0), dtime(23, 59))]
        args = argparse.Namespace(send=True, limit=1, confirmed_real_send=True)
        try:
            ss.cmd_run(args)
        except NetworkCallAttempted:
            pass  # attendu : l'espion lève volontairement pour bloquer tout envoi réel
        assert len(calls) == 1, f"Un seul appel réseau attendu, {len(calls)} observé(s)"
        (call_args, _) = calls[0]
        # send_via_resend_api(api_key, from_addr, from_name, to_addr, ...) -> to_addr est le 4e positionnel
        to_addr = call_args[3]
        assert to_addr == FAKE_CONTACT_EMAIL, f"Destinataire inattendu : {to_addr}"
        domain = to_addr.split("@", 1)[1]
        assert domain in RESERVED_TEST_DOMAINS, "Le destinataire de test doit rester sur un domaine réservé"
    finally:
        ss.send_via_resend_api = original


TESTS = [
    test_fake_contact_domain_is_reserved,
    test_confirmation_flag_required_for_run_send,
    test_outside_window_never_calls_network_even_with_confirmation,
    test_inside_window_calls_network_exactly_once_for_fake_contact_only,
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
    print(f"{len(TESTS)} test(s) OK — chemin d'envoi vérifié sans aucun appel réseau réel.")


if __name__ == "__main__":
    main()
