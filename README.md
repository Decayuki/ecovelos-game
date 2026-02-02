# 🎮 Gestion & Valeur Partenariale

**Serious game pédagogique pour élèves de Première STMG**

Simulateur de gestion d'entreprise illustrant les concepts de valeur ajoutée et valeur partenariale à travers 10 secteurs d'activité différents.

## 🚀 Démo en ligne

**URL :** https://ecovelos-game-web.vercel.app

## 📚 Thèmes disponibles

- 🚲 **ÉcoVélos** - Mobilité urbaine (vélos électriques)
- 🧴 **LuxeGlow** - Cosmétiques & beauté bio
- 🥊 **Iron Fist** - Salle de boxe premium
- 🎨 **Canvas & Co** - Galerie d'art contemporain
- ⚽ **FC Ambition** - Club de foot amateur
- 👕 **UrbanThread** - Marque streetwear éthique
- 🍽️ **Le Comptoir** - Restaurant gastro locavore
- 📦 **GreenBox** - Livraison de repas bio
- 🎮 **StreamLab** - Studio streaming e-sport
- 🐾 **PetCare+** - Animalerie moderne

## 🎯 Objectifs pédagogiques

- Calculer et comprendre la **valeur ajoutée**
- Distinguer valeur **actionnariale** vs valeur **partenariale**
- Prendre des décisions de gestion équilibrées
- Gérer budget, CA, coûts, satisfaction employés/clients
- Mesurer l'impact social et environnemental

## 🛠️ Technologies

- **Framework :** Next.js 14 (React)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS
- **Déploiement :** Vercel
- **Version :** v2.2

## 📖 Structure

```
ecovelos-game-web/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Logique principale du jeu
│   └── layout.tsx         # Layout global
├── components/            # Composants React
│   ├── Dashboard.tsx      # Tableau de bord financier
│   ├── ScoreBoard.tsx     # Scores (économique, social, environnemental)
│   ├── DecisionCard.tsx   # Cartes de décision
│   ├── TimeTransition.tsx # Écran de passage du temps
│   └── CompanyInfo.tsx    # Infos entreprise
├── lib/                   # Logique métier
│   ├── calculations.ts    # Calculs VA, scores, effets
│   ├── types.ts          # Types TypeScript
│   ├── game-data.json    # Données ÉcoVélos
│   ├── game-data-*.json  # Données des 9 autres thèmes
│   └── theme-phases-map.ts # Routing des thèmes
└── public/icons/         # Icônes SVG des thèmes
```

## 🎓 Mécaniques de jeu

### Phases
- **Phase 1 :** Lancement (3 décisions)
- **Phase 2 :** Partenariat stratégique (1 décision avec risque)
- **Phase 3 :** Croissance et dilemmes éthiques (3 décisions)

### Variables suivies
- **Budget** - Trésorerie
- **CA mensuel** - Chiffre d'affaires
- **Coûts mensuels** - Salaires, matières, maintenance, loyer, etc.
- **VA** - Valeur ajoutée (CA - Coûts)
- **Employés** - Nombre de salariés
- **Satisfaction** - Clients, employés, réputation
- **Scores** - Économique, social, environnemental, global

### Cohérence
- Salaires : **3000€/employé** partout
- Phase 3 = **RESET complet** (time skip 18 mois)
- Simulation de **3 mois** entre chaque phase
- Tous les effets impactent des variables réelles

## 🚀 Installation locale

```bash
# Cloner le repo
git clone https://github.com/Decayuki/ecovelos-game.git
cd ecovelos-game

# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Ouvrir http://localhost:3000
```

## 📝 Documentation complète

Voir les fichiers d'audit dans le repo parent :
- `GUIDE-PEDAGOGIQUE.md` - Guide pour élèves
- `CORRECTIONS-FINALES.md` - Récap des corrections
- `AUDIT-*.md` - Audits détaillés par thème

## 👨‍💻 Auteur

**Marc (yukimurra)**
- GitHub: [@Decayuki](https://github.com/Decayuki)
- Email: yukimurra@gmail.com

## 📄 Licence

MIT License - Libre d'utilisation pour l'éducation

---

**Créé en février 2026 avec Sally l'Assistante 🤖**
