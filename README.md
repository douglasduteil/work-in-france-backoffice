# work-in-france-backoffice

[![Build Status](https://travis-ci.com/SocialGouv/work-in-france-backoffice.svg?branch=master)](https://travis-ci.com/SocialGouv/work-in-france-backoffice)
[![codecov](https://codecov.io/gh/SocialGouv/work-in-france-backoffice/branch/master/graph/badge.svg)](https://codecov.io/gh/SocialGouv/work-in-france-backoffice)

Ce dépot doit remplacer à terme `work-in-france-extractor` et `work-in-france-bo-public`

Back office de Work In France:
- expose l'API de vérification d'une permis de demande d'autorisation de travail
- génére des statistiques mensuelles
- détecte les dossiers en souffrance
- envoie des tableaux de bord par mail

Les données utilisées proviennent de la base de données non exposée du dépôt `ds-aggregator`.

## Environnement de développement

pour lancer le projet en développement:

*démarrer et configurer `kinto`*

```bash
# run kinto in docker
yarn db:start

# configure kinto (launch only the first time)
yarn db:init
```

l'interface d'administation de kinto est accessible à l'adresse suivante `http://localhost:8889/v1/admin`:
- Compte `admin`: admin / passw0rd
- Compte `wif-bo`: wif-bo / W0rkInFranceND

configurer `work-in-france-backoffice`

```bash
cd ./packages/extractor
cp .env.sample .env
```

modifier les paramètres de `.env`

lancer `extractor`

```bash
yarn dev
```

*appeler les API de `extractor`:

lancer une synchronisation globale de rapports mensuels (dans tous les cas, les rapports mensuels sont créés le premier du mois à 8h du matin cf `.env.MONTHLY_REPORT_CRON`)
```bash
curl -X POST http://localhost:${.env.API_PORT}/api/${.env.API_PREFIX}/monthly-reports/sync-all
```

télécharger un rapport mensuel sous format `xlsx`
 ```bash
curl -X GET http://localhost:${.env.API_PORT}/api/${.env.API_PREFIX}/monthly-reports/:year/:month/:group/download
```

télécharger la liste des dossiers en souffrance sous le format `xlsx`
 ```bash
curl -X GET http://localhost:${.env.API_PORT}/api/${.env.API_PREFIX}/alerts/download
```

## Description

### kinto

- deux comptes: `admin`, `wif-bo`
- un groupe `system` dont `wif-bo` est membre
- une bucket `wif_public` avec 4 collections:

|Collection         |Description                                            | Modèle                                            |
|-------------------|-------------------------------------------------------|---------------------------------------------------|
|`monthly_reports`  | rapport mensuel pour les DIRECCT                      | `src/extractor/src/model/monthly-report.model.ts` |
|`alerts`           | dossiers en souffrance                                | `src/extractor/src/model/alert.model.ts`          |
|`validity-checks`  | validité des APT                                      | `src/extractor/src/model/validity-check.model.ts` |
|`synchro_histories`| stockage des informations de synchronisation          | `src/extractor/src/model/synchro-history.model.ts`|

## Synchronisation des données

La fréquence des synchronisations est paramétrable dans le `.env` en modifiant les expressions `cron`. A chaque synchronisation, 2 `timestamps` sont passés, celui de la dernière synchronisation et celui correspondant à la date courante. Cela permet de synchroniser uniquement le delta. Le `timestamp` de la dernière synchro est stocké dans la collection `synchro_histories`.

Liste des synchronisations:
- Création des `validity-check`: crée les `validity-check`(expression `cron` `.env.VALIDITY_CHECK_CRON`)
- Nettoyage des `validity-check`: supprime les `validity-check` expirés (expression `cron` `.env.VALIDITY_CHECK_CLEANER_CRON`)
- Création des `monthly-report`: crée et envoie les rapports mensuels pour les DIRECCT (expression `cron` `.env.MONTHLY_REPORT_CRON`)




## Règles de détection d'une dossier potentiellement en souffrance

- Règle 2 - `initiated` (en construction)
    - en construction depuis trop longtemps
- Règle 3 - `received` (en instruction)
    - en instruction depuis trop longtemps
- Règle 4 - `closed` (accepté)
    - Date manquante - soit début, soit fin
    - Date de début > Date de fin
    - Durée de APT > 12 mois
    - Messages de l'usager sans réponse envoyés après la date `processed_at`
- Règle 5 - `refused` (refusé)
    - Messages de l'usager sans réponse envoyés après la date `processed_at`
- Règle 6 - `without_continuation` (sans suite)
    - Messages de l'usager sans réponse envoyés après la date `processed_at`

