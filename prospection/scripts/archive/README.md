# Archive

Scripts retirés du pipeline actif de `prospection/`, gardés au cas où plutôt
que supprimés.

## `generate_hooks.py`

Génération d'accroche personnalisée par contact via Claude Haiku. Retiré le
20/08/2026 (prompt de correction #7) : le ton nécessitait deux corrections
successives (vouvoiement, puis ton critique/froid) malgré un prompt système
avec few-shot, jugé pas assez fiable pour la valeur ajoutée par rapport à
une accroche déterministe simple (voir `build_store_intro()` dans
`send_sequence.py` et la section correspondante de `prospection/README.md`).

N'est plus appelé par aucun script actif. Pour le refaire tourner : dépend
du paquet `anthropic` (retiré de `prospection/scripts/requirements.txt`,
`pip3 install anthropic` avant de le relancer) et de `ANTHROPIC_API_KEY`
dans `prospection/.env` (retirée aussi — elle ne sert plus qu'au chatbot du
site, dans `.env.production` à la racine).
