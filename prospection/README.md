# Prospection (cold email) — Cartwyn

Pipeline de prospection à froid : listes StoreInspect → nettoyage/dédup →
accroche déterministe (catégorie → français) → séquence de 4 emails envoyée
progressivement.

Toutes les données de prospects (`listes/`), l'état de la séquence (`state/`) et les
identifiants (`.env`) sont exclus de Git — voir `prospection/.gitignore`. Ce
dossier contient des données personnelles (RGPD) : ne jamais les commiter, ne
jamais les partager hors de ce pipeline.

## Pipeline, dans l'ordre

```bash
# 1. Fusionner et nettoyer les CSV bruts de listes/
python3 prospection/scripts/clean_prospection_lists.py
# -> prospection/listes/clean/master-{date}.csv (prêt à importer)
# -> prospection/listes/clean/exclus-{date}.csv (audit des lignes exclues)

# 2. Charger les contacts dans l'état de la séquence (ne touche jamais un
#    contact déjà connu, pour ne pas relancer sa progression). L'accroche
#    déterministe (catégorie -> français, voir plus bas) est calculée à
#    l'import, directement depuis master-{date}.csv — pas d'étape séparée,
#    pas d'appel API (l'enrichissement par Claude Haiku a été retiré, voir
#    plus bas).
python3 prospection/scripts/send_sequence.py import --file prospection/listes/clean/master-{date}.csv

# 3. Aperçu : affiche ce qui serait envoyé, sans jamais appeler l'API Resend
python3 prospection/scripts/send_sequence.py run

# 4. Envoi réel — seulement après relecture manuelle de l'aperçu. Le script
#    vérifie tout seul, dans l'ordre, la blocklist Spamhaus DBL, le SPF/DKIM/
#    DMARC du domaine d'envoi, et le circuit-breaker bounce/plaintes ; il
#    s'arrête net et n'envoie rien si l'un des trois échoue. --send seul ne
#    suffit plus : le deuxième flag est un garde-fou volontairement verbeux
#    (voir "Incident du 20/08/2026" plus bas), impossible à taper par réflexe.
python3 prospection/scripts/send_sequence.py run --send --i-understand-this-sends-real-email

python3 prospection/scripts/send_sequence.py status   # résumé à tout moment,
                                                        # affiche la pause de
                                                        # sécurité si active

# Si le circuit-breaker s'est déclenché : diagnostiquer dans le dashboard
# Resend, corriger, PUIS lever explicitement la pause (aucune reprise
# automatique) :
python3 prospection/scripts/send_sequence.py resume --reason "ce qui a été vérifié/corrigé"

# Envoi de contrôle unique (pas un vrai prospect) : vérifie rendu + délivrabilité
# sans toucher à l'état de la vraie séquence (aucun contact marqué, pas de warmup).
# Même garde-fou --i-understand-this-sends-real-email obligatoire.
python3 prospection/scripts/send_sequence.py test-send votre-adresse-perso@example.com --i-understand-this-sends-real-email

# Vérifier le chemin d'envoi (fenêtre, garde-fous) sans AUCUN risque d'appel
# réseau réel ni de contact réel — à lancer avant de toucher au code d'envoi :
python3 prospection/scripts/tests/test_send_path_safety.py
```

`run` (avec ou sans `--send`) est fait pour être appelé par une tâche cron
périodique sur le serveur de production, pas pour tourner en continu : chaque
exécution regarde l'état de chaque contact et n'envoie que ce qui est dû ce
jour-là, dans la limite du palier de warmup en cours.

Installer les dépendances avant la première exécution :
```bash
pip3 install -r prospection/scripts/requirements.txt
```

## Domaine d'envoi : `cartwyn.fr`, décision finale

**Décision définitive du porteur du projet (20/08/2026).** Un domaine
satellite dédié (`cartwyn.online`) a été essayé puis écarté : il subit une
pénalité structurelle et non corrigible sur les filtres anti-spam à cause de
son TLD (règles SpamAssassin `FROM_SUSPICIOUS_NTLD` et `PDS_OTHER_BAD_TLD`,
indépendantes de toute configuration DNS — aucune quantité de SPF/DKIM/DMARC
bien réglés n'y change quoi que ce soit). Ce point ne doit plus être remis en
question sans que le porteur du projet le redemande explicitement (règle 19
du CLAUDE.md).

L'envoi part donc de `cartwyn.fr`, l'identité déjà publique du projet
(mentions légales, chatbot, formulaire) — voir plus bas pour l'adresse
exacte utilisée (`quentin@cartwyn.fr`), pas de nouvelle adresse à créer.

### Procédure DNS suivie

Leçon tirée de l'épisode satellite : **toujours lister les enregistrements
existants avant de toucher à quoi que ce soit**. État constaté en DNS le
20/08/2026, avant toute modification :
```
cartwyn.fr.        MX   5  mx1.hostinger.com. / 10 mx2.hostinger.com.
cartwyn.fr.        TXT  "v=spf1 include:_spf.mail.hostinger.com ~all"
_dmarc.cartwyn.fr.  TXT  "v=DMARC1; p=none"
```
C'est la vraie boîte `contact@cartwyn.fr` (Hostinger) et son SPF/DMARC.

- **SPF** : un seul enregistrement TXT `v=spf1` par domaine, jamais deux en
  parallèle (exactement ce qui avait cassé la vérification sur
  `cartwyn.online`, où deux `_dmarc` coexistaient). L'`include:` de Resend
  doit être **fusionné** dans l'enregistrement existant, pas ajouté à côté :
  `v=spf1 include:_spf.mail.hostinger.com include:<valeur exacte Resend> ~all`
  — valeur à copier telle quelle depuis l'onglet **Records** du domaine dans
  le dashboard Resend, jamais devinée (elle inclut probablement
  `amazonses.com`, Resend tournant sur AWS SES en arrière-plan, mais à
  confirmer plutôt qu'à supposer).
- **DKIM** : `resend._domainkey.cartwyn.fr` (sélecteur `resend`, distinct de
  tout DKIM existant — pas de conflit possible). **Déjà publié et vérifié en
  DNS le 20/08/2026** — cette étape est faite.
- **DMARC** : `_dmarc.cartwyn.fr` existe déjà (`p=none`, un seul
  enregistrement, confirmé) — rien à changer, Resend valide via
  l'alignement SPF/DKIM, pas par expéditeur nommé.
- Ajouter `cartwyn.fr` dans le dashboard Resend et attendre le statut
  **Verified** (pas de suppositions — un vert confirmé).

`send_sequence.py run --send` vérifie SPF sur `SENDING_DOMAIN` et DKIM+DMARC
sur `ROOT_DOMAIN` (les deux valent `cartwyn.fr` ici, gardés distincts dans le
code par prudence — voir `check_domain_auth()`).

**Piège rencontré en pratique, déjà corrigé dans le script** : juste après
une modification DNS (ex. suppression d'un `_dmarc` en double), le résolveur
DNS système d'une machine peut encore répondre avec l'ancienne valeur en
cache alors que les résolveurs publics (1.1.1.1, 8.8.8.8) ont déjà la bonne
— `send_sequence.py` interroge donc explicitement ces résolveurs publics
pour SPF/DKIM/DMARC. Exception : la vérification Spamhaus DBL doit au
contraire passer par le résolveur **système**, pas par 1.1.1.1/8.8.8.8 —
Spamhaus bloque les requêtes de son DNSBL gratuit relayées via ces gros
résolveurs publics partagés (réponse d'erreur `127.255.255.254`, à ne
surtout pas confondre avec une vraie mise en liste).

### Adresse unique : `quentin@cartwyn.fr`

Décision du porteur du projet (20/08/2026) : `quentin@cartwyn.fr`, pas
`contact@cartwyn.fr` — une seule boîte pour les trois usages (`From:`,
mention de désabonnement dans le corps, et compte surveillé par le polling
IMAP), plutôt que dispersé sur plusieurs adresses. Boîte Hostinger
existante, accès IMAP confirmé actif (connexion testée le 20/08/2026).
Remplir `RESEND_FROM_EMAIL`/`UNSUBSCRIBE_ADDRESS`/`IMAP_USER` dans
`prospection/.env` avec cette même adresse (voir `.env.example`).

## Relais d'envoi : Resend

**Choix : [Resend](https://resend.com/pricing).** Comparaison faite le
2026-08-20 directement sur les grilles tarifaires officielles :

| Relais | Palier gratuit | Coût au-delà (bas volume) |
|---|---|---|
| **Resend** | 3 000 emails/mois, plafonné à 100/jour | $20/mois pour 50 000 emails (Pro) |
| Mailgun | 100 emails/jour, $0/mois | Basic $15/mois pour 10 000 emails |
| Postmark | **100 emails/mois** (pas /jour) | Basic $15/mois pour 10 000 emails |
| Amazon SES | Pas de palier gratuit dédié (crédit AWS promotionnel ponctuel) | $0,10 / 1 000 emails à la carte |

Au volume actuel (quelques dizaines à quelques centaines d'emails/mois, warmup
à 8-50/jour — voir plus bas), Resend et Mailgun sont tous les deux
effectivement gratuits. Resend l'emporte : palier gratuit le plus confortable
pour ce volume, vérification de domaine (SPF/DKIM/DMARC) en quelques
enregistrements DNS simples, et surtout une **API HTTP qui renvoie un id par
email envoyé** — indispensable au circuit-breaker (voir plus bas).

**Envoi via l'API HTTP Resend, pas leur relais SMTP.** `send_sequence.py`
appelle `POST https://api.resend.com/emails` directement plutôt que de passer
par un serveur SMTP. Raison technique précise : seule l'API HTTP renvoie un
`id` par email (`GET /emails/{id}` donne ensuite son `last_event` :
`delivered`, `bounced`, `complained`...), ce qui permet de repoller le statut
de chaque envoi depuis un script cron sans avoir besoin d'un serveur pour
recevoir les webhooks Resend en continu. Le relais SMTP générique ne donne
pas cet identifiant exploitable. Ça reste "un relais tiers, jamais de SMTP
brut depuis le VPS" au sens de la règle 19 du CLAUDE.md — c'est juste son API
HTTP plutôt que son endpoint SMTP.

**Clé API : permission "Full Access" obligatoire, pas "Sending access".**
Constaté en pratique le 20/08/2026 : une clé restreinte à l'envoi seul peut
envoyer, mais `GET /emails/{id}` lui répond 401 (`restricted_api_key`) — le
circuit-breaker ne peut alors jamais lire de statut, calcule toujours 0% de
bounce/plainte, et ne se déclenche donc jamais, même en cas de vrai
problème. Dashboard Resend → API Keys → Full Access.

**Réserve à lire avant tout envoi réel** : les CGU des quatre relais comparés
positionnent leur service pour de l'email **transactionnel ou opt-in**, pas
pour de la prospection à froid pure. Les CGU/AUP d'AWS SES et de Postmark
interdisent explicitement l'envoi à des listes non-opt-in ; Mailgun et Resend
sont formulés de façon similaire (listes basées sur la permission). Dans la
pratique, beaucoup de petites structures envoient ce type de prospection B2B
peu volumineuse, personnalisée, avec désabonnement facile et faible taux de
plainte sans être inquiétées — c'est précisément l'esprit du warmup
progressif, de la détection de réponse et des garde-fous ci-dessous. Le
risque pèse maintenant sur `cartwyn.fr`, le domaine de production partagé
avec le formulaire de contact et les échanges clients réels : au moindre pic
de plaintes, Resend peut suspendre le compte, avec un effet de bord sur ces
emails-là aussi — d'où le circuit-breaker automatique plutôt qu'une simple
surveillance manuelle.

## Garde-fous de réputation

### 1. Blocklist Spamhaus DBL, avant chaque batch

Avant tout `run --send`, requête DNS directe sur
`{ROOT_DOMAIN}.dbl.spamhaus.org` (donc `cartwyn.fr` — `check_spamhaus_dbl`
dans `send_sequence.py`, résolveur système, voir remarque plus haut sur le
piège 1.1.1.1/8.8.8.8). Si le domaine est listé — ou si la vérification
échoue pour une autre raison (panne DNS, timeout) — l'envoi est annulé, rien
ne part (fail-closed : en cas de doute, ne pas envoyer plutôt que de risquer
un envoi non vérifié).

### 2. Circuit-breaker bounce/plaintes

À chaque `run --send`, le script repolle via l'API Resend (`GET
/emails/{id}`) le statut de chaque email envoyé dans les 14 derniers jours,
et calcule le taux de bounce et de plainte sur cet échantillon. En dessous de
20 envois trackés, pas assez de signal pour juger — l'envoi est autorisé.
Au-dessus, si l'un des deux seuils est dépassé :

- **Bounce ≥ 2%** — seuil d'application dur de Gmail/Yahoo/Microsoft (au-delà,
  rejet permanent des emails suivants). Resend lui-même exige un taux de
  bounce de compte < 4%.
- **Plainte ≥ 0,08%** — seuil recommandé par Resend lui-même
  (resend.com/blog/four-ways-to-hurt-your-sender-reputation). Gmail impose un
  seuil dur de 0,3% mais recommande de rester sous 0,1% — on retient le plus
  strict des deux (celui de Resend) pour réagir tôt.

*(Seuils vérifiés le 20/08/2026 sur la documentation Resend et les seuils
publics Gmail/Yahoo/Microsoft — pas inventés. À revoir si ces politiques
changent.)*

Si un seuil est dépassé : le script arrête immédiatement tout envoi (y
compris le reste du batch en cours), écrit une **pause de sécurité**
persistante en base (visible en tête de `status`, bloque aussi bien l'aperçu
que `--send` tant qu'elle est active), et journalise le taux précis et le
seuil dépassé. La seule façon de reprendre est explicite :
```bash
python3 prospection/scripts/send_sequence.py resume --reason "ce qui a été vérifié/corrigé"
```
`--reason` est obligatoire — la levée de la pause est journalisée avec son
motif, pas juste effacée en silence.

### 3. Warmup, délibérément prudent

`cartwyn.fr` est le domaine de production : départ plus bas, montée plus
lente qu'un domaine satellite jetable n'aurait exigé (chaque palier ≤ 1,5x
le précédent, étalée sur ~5 semaines, conforme aux recommandations générales
de warmup vérifiées le 20/08/2026). Palier explicite et modifiable dans
`WARMUP_SCHEDULE` en tête de `send_sequence.py` :

| Jour depuis le 1er envoi | Plafond / jour |
|---|---|
| 0 | 8 |
| 5 | 12 |
| 10 | 18 |
| 15 | 25 |
| 21 | 35 |
| 28 | 45 |
| 35 | 50 |

À ajuster à la main selon la délivrabilité réellement observée (taux de
plainte, bounces, arrivée en spam) — ces chiffres sont un point de départ
raisonnable, pas une garantie.

### 4. Fenêtre d'envoi

`run --send` n'envoie réellement que mardi, mercredi ou jeudi, entre
9h30-11h ou 14h-15h heure de Paris (`within_sending_window()` dans
`send_sequence.py`, bornes dans `SENDING_WEEKDAYS`/`SENDING_TIME_RANGES` en
tête de fichier, modifiables). En dehors de cette fenêtre, le script ne fait
rien même s'il est déclenché par le cron — il logue et attend le prochain
créneau, ce n'est pas une erreur. Ne s'applique qu'à `run --send` : l'aperçu
(`run` sans `--send`) et `test-send` (envoi de contrôle manuel et
volontaire, pas une vague) restent utilisables à tout moment.

## Séquence et suivi des réponses

4 emails par contact (`prospection/templates/email-1.txt` à `email-4.txt`),
délais aléatoires après l'email précédent : J3-4, J7-8, J12-14. Dès qu'une
réponse est détectée par sondage IMAP (`run` la vérifie à chaque exécution),
la séquence s'arrête immédiatement pour ce contact. Un mot-clé de
désabonnement dans une réponse (STOP, désinscrire, unsubscribe...) alimente la
liste de suppression, vérifiée avant chaque envoi — y compris pour de
futures listes importées différentes.

**Salutation variée** : `{{salutation}}` (utilisé dans `email-1.txt` et
`email-4.txt`) tire au sort "Hello," ou "Salut," à chaque email réellement
rendu (`SALUTATIONS` dans `send_sequence.py`) — pas fixé par contact, pour
rester simple à fusionner sans état supplémentaire. Un même contact peut
donc voir "Hello," sur l'email 1 et "Salut," sur l'email 4, ou l'inverse.
Bénéfice secondaire : un texte pas totalement identique d'un envoi à
l'autre réduit aussi le risque qu'un volume de prospection avec une
formulation quasi-identique soit repéré comme un pattern d'envoi de masse
par les filtres.

## Email 1 : texte final (20/08/2026)

`templates/email-1.txt` est maintenant le texte rédigé directement par le
porteur du projet (deux corrections mineures apportées : accord grammatical
"paniers abandonnés", et l'accroche déterministe à la place d'un espace
réservé). Salutation fixe "Hello," — plus de `{{first_name}}` dans l'email 1
(choix du porteur du projet), ce qui simplifie au passage la logique de
rendu : plus besoin de gérer un cas particulier de salutation pour les
contacts génériques sur cet email.

Historique, pour mémoire : une version précédente mélangeait vouvoiement et
tutoiement dans la même phrase ("il vous arrive" alors que le reste du mail
tutoie) — non pertinent sur le texte actuel, entièrement réécrit.

## Accroche déterministe (remplace Claude Haiku, retiré le 20/08/2026)

**Haiku a été retiré du pipeline.** Deux corrections de ton avaient déjà été
nécessaires sur l'accroche générée (vouvoiement, puis ton critique/froid —
voir l'historique Git de ce fichier pour le détail) ; le porteur du projet a
jugé la fiabilité insuffisante par rapport à la valeur ajoutée d'une
accroche générée. `generate_hooks.py` est déplacé dans
`prospection/scripts/archive/` (gardé au cas où, plus appelé par aucun
script actif) ; `ANTHROPIC_API_KEY` n'est plus dans `prospection/.env` (elle
reste dans `.env.production` à la racine, pour le chatbot du site — fichier
distinct, non affecté).

À la place : une accroche déterministe, construite dans `build_store_intro()`
(`send_sequence.py`) directement depuis `category`/`store_name` de
`master-{date}.csv`, calculée à l'import, sans appel API :
- Catégorie mappée (table `CATEGORY_FR`, construite à partir des valeurs
  réellement présentes dans les données du 20/08/2026 — Beauty, Fashion,
  Home & Garden, Jewelry — à étendre au fur et à mesure des futurs exports,
  pas devinée à l'avance) : *"J'ai vu que tu gérais une boutique de
  {catégorie en français} et ça a l'air de fonctionner super bien !"*
- Catégorie absente ou non mappée : repli sur le nom de la boutique plutôt
  que d'insérer un mot anglais brut ou un trou dans la phrase — *"J'ai vu ta
  boutique {nom} et ça a l'air de fonctionner super bien !"*

`send_sequence.py import` logue le nombre de contacts dans chaque cas
(catégorie mappée vs repli), même logique de visibilité sur la qualité du
batch que ce qui existait pour Haiku.

## Réduire le classement en Promotions (Gmail)

**Le header `List-Unsubscribe` (RFC 8058) reste obligatoire** — légalement
et parce qu'il est exigé par les règles expéditeurs en volume de Gmail/Yahoo
depuis 2024. Le retirer serait contre-productif (retour en boîte spam pure
plutôt que Promotions) : il n'a pas été touché.

Signaux contrôlables ajustés le 20/08/2026, sans toucher à la conformité :
- **Bloc de désabonnement** : plus de séparateur `"---"` isolé (forme
  typique de mail merge) ni de phrase longue ; une ligne courte en fin de
  message, `Se désinscrire : quentin@cartwyn.fr` — une adresse email en
  texte brut est automatiquement transformée en lien cliquable par la
  quasi-totalité des clients mail (Gmail inclus), pas besoin de HTML.
  Appliquée aux 4 templates (la ligne est ajoutée programmatiquement par
  `UNSUBSCRIBE_BODY_SUFFIX`, pas copiée dans chaque fichier — donc déjà
  présente partout par construction, vérifié sur les 4).
- Envoi confirmé en texte brut (champ `text` de l'API Resend, jamais `html`)
  — vérifié sur le contenu réellement envoyé (`GET /emails/{id}` renvoie
  `"html": null`), pas seulement sur le template source.

**Nom d'expéditeur : revenu à "Cartwyn"** (compromis assumé, pas un oubli).
Le porteur du projet a vu les deux versions sur un envoi de test réel
("Quentin Guez" et "Cartwyn") et préfère "Cartwyn" — décision prise en
connaissance de cause : un nom de marque reste un signal plus fort vers le
classement Promotions par Gmail qu'un nom de personne (l'algorithme observe
notamment ce signal, en plus du header List-Unsubscribe, du HTML/texte brut,
et de l'engagement réel des destinataires). `DEFAULT_FROM_NAME = "Cartwyn"`
dans `send_sequence.py`, ne pas rechanger sans qu'il le redemande.

**Dans tous les cas, ça réduit le risque, ça ne le garantit pas** : le
classement Promotions vs Principale reste un signal parmi d'autres dans un
algorithme Gmail non documenté publiquement, qui prend aussi en compte
l'engagement réel (réponses, ouvertures, un destinataire qui déplace
manuellement vers Principale) — ça s'améliore avec le temps, comme la
réputation du domaine via le warmup, pas instantanément avec un changement
de config.

## Envoi de contrôle (`test-send`)

`send_sequence.py test-send <email> --i-understand-this-sends-real-email`
envoie un seul email réel (étape 1, avec une vraie accroche déterministe
calculée à partir d'un contact de `master-{date}.csv`, ou une accroche de
démo si aucun fichier n'est disponible) vers l'adresse donnée — pour
vérifier concrètement rendu et délivrabilité avant une vraie campagne.
Vérifie SPF/DKIM/DMARC et la blocklist Spamhaus comme un envoi réel, mais
ignore le palier de warmup et la fenêtre d'envoi (un envoi de contrôle
isolé et volontaire, pas une vague) et ne modifie **aucun** état de
séquence : aucun contact marqué contacté, aucun impact sur le suivi de
progression des vraies séquences.

**`--i-understand-this-sends-real-email` est obligatoire** (en plus de
`--send` pour `run`) — voir la section incident ci-dessous pour pourquoi.

## Déploiement et tests automatisés

**Tests** (aucun risque réseau/données réelles, à lancer avant de toucher au
code d'envoi) :
```bash
python3 prospection/scripts/tests/test_send_path_safety.py
python3 prospection/scripts/tests/test_state_machine.py
```

**Sur le VPS de production** (`51.210.40.108`, voir CLAUDE.md) : le code de
`prospection/` est déployé dans `~/cartwyn/prospection` (même dépôt Git que
le site), avec son propre environnement virtuel Python
(`prospection/scripts/venv/`, dépendances de `requirements.txt`) et son
propre `prospection/.env` (copié par `scp`, jamais commité, permissions
`600`). L'état de la séquence (`prospection/state/sequence.db`) y a été
copié tel quel depuis la machine de développement au moment du déploiement
initial (20/08/2026) pour continuer la même campagne, pas en repartir de
zéro.

**Tâche cron réelle**, confirmée active (`crontab -l`) :
```
0 * * * * cd /home/ubuntu/cartwyn/prospection/scripts && /bin/bash -c 'set -a; source ../.env; set +a; ./venv/bin/python3 send_sequence.py run --send --i-understand-this-sends-real-email' >> /home/ubuntu/cartwyn/prospection/state/cron.log 2>&1
```
Se déclenche toutes les heures ; c'est la fenêtre d'envoi (mar/mer/jeu,
9h30-11h ou 14h-15h heure de Paris) et le palier de warmup qui décident si
un envoi part réellement à ce moment-là — la plupart des déclenchements ne
font donc rien, c'est le fonctionnement attendu. Sortie (y compris les
éventuelles erreurs) redirigée vers `prospection/state/cron.log`, à
consulter en cas de doute plutôt que de supposer que ça tourne bien.

Pour mettre à jour le code sur le VPS après un futur changement : `git pull`
dans `~/cartwyn`, puis `./venv/bin/pip install -r
prospection/scripts/requirements.txt` si les dépendances ont changé — le
cron n'a pas besoin d'être relancé, il repart tout seul à l'heure suivante
avec le code à jour.

## Incident du 20/08/2026 : deux emails réels envoyés par erreur pendant un test

**Ce qui s'est passé.** En testant la logique de fenêtre d'envoi (section
"Fenêtre d'envoi" plus haut), un script de diagnostic ponctuel (pas un
fichier de test versionné) a appelé le code d'envoi réel directement sur
l'état contenant les 17 vrais contacts déjà importés. Deux emails sont
partis pour de vrai :

- `ek@ekstyling.com` — 2026-08-20 14:05:20 UTC, id Resend
  `4ac09407-1f8d-4627-95da-11c1207a98dc`, statut `delivered`.
- `contact@ambracelet.com` — 2026-08-20 14:05:30 UTC, id Resend
  `02b45a8e-3a47-4efe-8ee9-08f08ba71376`, statut `delivered`.

Contenu confirmé (relu depuis l'API Resend, source de vérité, pas supposé) :
sujet, salutation, accroche déterministe et corps corrects et complets pour
les deux — aucune variable cassée, aucune accroche vide. Rien d'autre n'est
parti : le `send_log` complet de cette session ne contient que ces deux
lignes.

**Cause exacte : partiellement établie, pas à 100%.** Un des deux envois
(`contact@ambracelet.com`) est directement attribuable à un script qui
neutralisait volontairement la fenêtre d'envoi pour observer la suite du
code — une erreur de méthode claire : ce test n'aurait jamais dû pouvoir
exercer le vrai chemin d'envoi sur les vraies données importées, quel que
soit ce qu'il cherchait à vérifier. Pour l'autre (`ek@ekstyling.com`), la
commande exécutée juste avant a bien affiché "Hors fenêtre d'envoi, rien
n'est envoyé" — donc un refus apparent — mais l'horodatage de cet envoi
(9 secondes avant l'autre) tombe précisément dans la fenêtre d'exécution de
cette même commande. Une reproduction a posteriori du même scénario, avec
l'appel réseau intercepté et une base isolée, confirme que le code tel qu'il
existe aujourd'hui refuse bien d'envoyer hors fenêtre (zéro appel réseau,
zéro ligne ajoutée en base). Il n'a donc pas été possible d'établir avec
certitude absolue le mécanisme exact qui a produit cet envoi précis — les
deux pistes les plus probables sont soit un état transitoire non capturé
lors de cette commande précise, soit une alternance de sortie
(stdout/stderr) qui aurait masqué une ligne d'envoi dans ce qui a été
observé. Ce n'est pas présenté comme résolu avec certitude, seulement
comme la meilleure reconstitution possible avec les éléments disponibles.

**Correctif structurel (pas juste "faire plus attention").**
1. `--i-understand-this-sends-real-email` : flag obligatoire en plus de
   `--send` (pour `run`) et de `test-send`, volontairement long et explicite
   — beaucoup plus dur à ajouter par réflexe dans un script rapide qu'un
   simple `--send`. Sans lui, refus immédiat, avant même d'ouvrir la base ou
   de lire les identifiants Resend (`REAL_SEND_CONFIRMATION_FLAG` dans
   `send_sequence.py`).
2. `prospection/scripts/tests/test_send_path_safety.py` : seul pattern
   désormais autorisé pour tester le chemin d'envoi — base SQLite isolée
   (jamais `prospection/state/sequence.db`), `send_via_resend_api` remplacée
   par un espion qui lève une exception au lieu d'ouvrir une connexion
   réseau (donc échec du test plutôt qu'un vrai envoi en cas de bug), et
   contact fabriqué sur un domaine réservé RFC 2606
   (`audit-test@example.invalid`) qui ne peut physiquement pas correspondre
   à un vrai prospect — vérifié par un test dédié. 4/4 tests passent.

**Les deux contacts concernés.** `ek@ekstyling.com` et
`contact@ambracelet.com` sont passés en statut `paused` dans l'état SQLite
(`next_send_at = NULL`) — ni désinscrits, ni supprimés, juste suspendus.
Aucune relance automatique tant que le porteur du projet n'a pas décidé de
la suite. Les 15 autres contacts importés n'ont pas été touchés.
