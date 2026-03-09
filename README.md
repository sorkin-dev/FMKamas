# FMKamas — Forgemagie Assistant

Application de bureau complète et standalone d'assistance à la forgemagie Dofus 3.5. Conseiller stratégique avancé et moteur d'IA décisionnelle pour le choix des runes, l'optimisation du sink, la planification de remontage de jets et l'aide à la décision pour les tentatives d'exotisme.

## Screenshots

```
┌──────────────────────────────────────────────────────────┐
│  ⚒️ FMKamas — Forgemagie Assistant              [⚙️]     │
├──────┬───────────────────────────────────────────────────┤
│ ⚒️   │  🔍 Rechercher un objet...                        │
│ 📦   │  ┌─────────────┐  ┌─────────────────────────┐    │
│ 📊   │  │ Gelano       │  │ 💧 Sink / Puits          │   │
│ ⚙️   │  │ Niv. 60      │  │ [====60%====    ]        │   │
│      │  │ Anneau       │  │ Dispo: 45.5 pts          │   │
│      │  └─────────────┘  └─────────────────────────┘    │
│      │                                                   │
│      │  📊 Stats Actuelles  │  🎯 Stats Objectif         │
│      │  Vitalité: 31/50     │  Vitalité: ━━━ 50          │
│      │  Force: 16/25        │  Force:    ━━━ 25          │
│      │                                                   │
│      │  🤖 Recommandation IA                             │
│      │  ⚒️ Appliquer Rune Fo                             │
│      │  "La Force est 9 pts sous son objectif..."        │
│      │  Probabilité: 92% │ Risque: Faible               │
│      │  Coût estimé: ~15k kamas                          │
└──────┴───────────────────────────────────────────────────┘
```

## Fonctionnalités

- 🤖 **IA Décisionnelle** : Recommandations de runes en français avec explication
- 💧 **Calcul du Sink** : Visualisation et calcul automatique du puits disponible
- 🎲 **Monte Carlo** : Simulation probabiliste pour estimer coûts et chances de succès
- 📊 **Analyse EV** : Espérance de valeur optimiste/médiane/pessimiste
- 🔮 **Exotisme** : Évaluation des conditions pour tenter PA/PM/PO/Invoc
- 📦 **Base d'items** : 20 items Dofus inclus, synchronisation API Dofusdude
- 📜 **Historique** : Sessions de forge sauvegardées en SQLite local
- ⚙️ **Stratégies** : Génération et comparaison de 5 stratégies alternatives

## Stack Technique

- **Runtime**: Electron 28
- **Frontend**: React 18 + TypeScript strict
- **State**: Zustand
- **UI**: Tailwind CSS (dark mode premium)
- **Persistence**: better-sqlite3
- **Build**: Vite (renderer) + tsc (main)
- **Packaging**: electron-builder
- **Tests**: Vitest (51 tests)

## Prérequis

- Node.js 20+
- npm 9+

## Installation

```bash
npm install
```

## Lancement (développement)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Packaging Windows (.exe)

```bash
npm run package:win
```

## Tests

```bash
npm run test
```

## Architecture

```
src/
├── main/          # Electron main process (IPC, SQLite, preload)
├── renderer/      # React UI (components, pages, hooks, store)
├── domain/        # Moteur métier pur (probabilités, sink, Monte Carlo, IA)
├── application/   # Services et use cases
├── infrastructure/# Providers de données, repositories, cache
└── shared/        # Types IPC, utilitaires
data/
├── seeds/         # items.json (20 items), runes.json, stat-weights.json
└── schemas/       # Schéma JSON de validation
tests/             # 51 tests Vitest
```

## Modèle Probabiliste

### Formules

- **Probabilité de succès** : `P = baseProbability × sinkFactor`
  - Stat < max naturel : base ≈ 90–95%
  - Stat = max naturel : base ≈ 65%
  - Overmage : base décroissante exponentiellement
- **Sink Factor** : `0.6 + 0.4 × min(1, availableSink / runeWeight)`
- **Sink disponible** : `Σ (max[stat] - current[stat]) × weight[stat]` pour les stats sous max

### Hypothèses et limites

- Les probabilités d'exotisme (PA/PM/PO/Invoc) sont des **estimations communautaires** et ne reflètent pas les probabilités exactes du jeu.
- Le modèle de perte de stats en cas d'échec est simplifié.
- Les prix des runes sont configurables et doivent être mis à jour selon le marché.

## Disclaimer légal

FMKamas est un outil externe indépendant. Il ne lit pas la mémoire du jeu, ne s'injecte pas dans le client, n'automatise aucune action et ne contourne aucune règle. L'utilisateur saisit manuellement l'état de l'objet.

## Licence

MIT

