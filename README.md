# FMKamas — Forgemagie Assistant

Application de bureau complète et standalone d'assistance à la forgemagie Dofus 3.5. Conseiller stratégique avancé et moteur d'IA décisionnelle pour le choix des runes, l'optimisation du sink, la planification de remontage de jets et l'aide à la décision pour les tentatives d'exotisme.

---

## 🚀 Comment exécuter le programme ?

### Option A — Installer et lancer le `.exe` (utilisateurs Windows)

1. Téléchargez le fichier **`FMKamas Setup 1.0.0.exe`** depuis la section [Releases](../../releases) du dépôt.
2. Double-cliquez sur l'installateur et suivez les étapes.
3. Lancez **FMKamas** depuis le raccourci créé sur le Bureau ou dans le menu Démarrer.

> Si vous préférez la version **portable** (sans installation), téléchargez `FMKamas 1.0.0.exe` et lancez-le directement.

---

### Option B — Lancer depuis les sources (développeurs)

> **Prérequis :** Node.js 20+ et npm 9+

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en mode développement (fenêtre Electron + rechargement à chaud)
npm run dev
```

L'application s'ouvre automatiquement dans une fenêtre Electron.

---

### Option C — Créer le `.exe` soi-même (Windows)

> **Prérequis supplémentaires :** Python 3.x et Visual Studio Build Tools (composant « Desktop development with C++ »)

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler le code source
npm run build

# 3. Packager en installateur Windows
npm run package:win
```

Les fichiers produits se trouvent dans le dossier **`dist/`** :
| Fichier | Description |
|---|---|
| `FMKamas Setup 1.0.0.exe` | Installateur NSIS (recommandé) |
| `FMKamas 1.0.0.exe` | Version portable (sans installation) |

---

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

### Prérequis Windows
- Node.js 20+ (avec npm)
- Python 3.x (requis par `node-gyp` pour compiler `better-sqlite3`)
- Visual Studio Build Tools (ou Visual Studio Community) avec le composant « Développement Desktop en C++ »

### Commandes

```bash
# 1. Installer les dépendances (reconstruit better-sqlite3 pour Electron)
npm install

# 2. Construire l'application
npm run build

# 3. Packager en .exe
npm run package:win
```

Le fichier `.exe` sera créé dans **`dist/`** :
- `dist/FMKamas Setup 1.0.0.exe` — installateur NSIS (recommandé)
- `dist/FMKamas 1.0.0.exe` — portable (sans installation)

### Notes
- Le packaging doit être exécuté sur **Windows** pour produire un `.exe` natif.
- Sur Linux/macOS, vous pouvez compiler pour Windows avec Wine : `electron-builder --win --x64`

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

