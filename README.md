# ÉcoVélos Manager - Application Web

Application web de simulation pédagogique pour le chapitre 12 : La valeur ajoutée et la valeur partenariale.

## Installation

```bash
# Dans le dossier ecovelos-game-web
npm install
```

## Lancement

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Build pour production

```bash
npm run build
npm start
```

## Structure du projet

```
ecovelos-game-web/
├── app/
│   ├── page.tsx          # Page principale du jeu
│   ├── layout.tsx        # Layout global
│   └── globals.css       # Styles globaux
├── components/
│   ├── Dashboard.tsx     # Tableau de bord financier
│   ├── ScoreBoard.tsx    # Tableau des scores
│   ├── DecisionCard.tsx  # Cartes de décision
│   └── PhaseIntro.tsx    # Introduction des phases
├── lib/
│   ├── types.ts          # Types TypeScript
│   └── calculations.ts   # Logique de calcul VA et scores
└── game-data.json        # Données du jeu (importé depuis parent)
```

## Fonctionnalités

### Interface de jeu
- ✅ Dashboard en temps réel (budget, CA, VA, coûts)
- ✅ Scores économique, social, environnemental
- ✅ 3 phases progressives avec contexte narratif
- ✅ Cartes de décision interactives
- ✅ Calcul automatique des effets
- ✅ Écran de résultats avec analyse

### Calculs pédagogiques
- ✅ Valeur ajoutée = CA - Consommations intermédiaires
- ✅ Répartition de la VA entre parties prenantes
- ✅ Scoring équilibré (économique 40%, social 30%, environnemental 30%)
- ✅ Impact des décisions sur tous les indicateurs

## Utilisation en classe

### Avant la séance
1. Lancer l'application sur l'ordinateur de l'enseignant
2. Projeter l'écran pour toute la classe
3. Ou : partager le lien (si hébergé) pour que chaque groupe joue sur sa machine

### Pendant la séance (60 min)
- **10 min** : Introduction du jeu et objectifs pédagogiques
- **15 min** : Phase 1 (Lancement)
- **15 min** : Phase 2 (Partenariat)
- **15 min** : Phase 3 (Éthique)
- **5 min** : Résultats et scores finaux

### Après la séance
- **15 min** : Débriefing collectif avec les questions de discussion

## Personnalisation

Pour modifier les mécaniques de jeu, éditer le fichier `game-data.json` :
- Ajuster les coûts et revenus
- Modifier les effets des décisions
- Ajouter/retirer des options
- Changer les seuils de scoring

## Technologies

- **Next.js 14** : Framework React
- **TypeScript** : Typage fort
- **Tailwind CSS** : Styles utilitaires
- **Recharts** : Graphiques (potentiel ajout futur)

---

Créé le 2026-02-01 par Sally l'Assistante 💅
