# work-in-france-backoffice

Ce dépot doit remplacer à terme `work-in-france-extractor` et `work-in-france-bo-public`

Back office de Work In France:
- expose l'API de vérification d'une permis de demande d'autorisation de travail
- génére des statistiques mensuelles
- détecte les dossiers en souffrance
- envoie des tableaux de bord par mail

Les données utilisées proviennent de la base de données non exposée du dépôt `ds-aggregator`.

## Règles de détection d'une dossier potentiellement en souffrance

- Règle 1:
    - Trop de messages
- Règle 2 - `initiated` (en construction)
    - en construction depuis trop longtemps
- Règle 3 - `received` (en instruction)
    - Durée d'instruction trop longue après x jours
- Règle 4 - `closed` (accepté)
    - Date manquante - soit début, soit fin
    - Date de début > Date de fin
    - Durée de APT > 12 mois
    - Messages envoyés après la date `processed_at`
- Règle 5 - `refused` (refusé)
    - Messages envoyés après la date `processed_at`
- Règle 6 - `without_continuation` (sans suite)
    - Messages envoyés après la date `processed_at`