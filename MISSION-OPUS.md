# 🎯 MISSION OPUS - Analyse approfondie et correction des incohérences

**Agent :** Opus (Claude)  
**Date :** 2026-02-02  
**Contexte :** Serious game pédagogique STMG 1A - 10 thèmes d'entreprise  
**Objectif :** Cohérence absolue de tous les thèmes  

---

## 📖 Contexte du projet

### Le jeu

**Titre :** Gestion & Valeur Partenariale  
**Public :** Élèves de Première STMG (lycée)  
**Durée :** 45-60 minutes en classe  
**Structure :** 3 phases (Lancement → Partenariat → Dilemmes éthiques)  

**Concepts enseignés :**
- Valeur ajoutée (VA = CA - Coûts)
- Valeur actionnariale vs partenariale
- Gestion équilibrée (économie, social, environnement)
- Impact des décisions sur les parties prenantes

### Les 10 thèmes

| ID | Nom | Secteur | Difficulté | Agent créateur |
|----|-----|---------|------------|----------------|
| ecovelos | ÉcoVélos | Vélos électriques | ⭐⭐ | Sally (référence) |
| luxeglow | LuxeGlow | Cosmétiques bio | ⭐⭐⭐ | Agent 1 |
| ironfist | Iron Fist | Salle de boxe | ⭐⭐⭐ | Agent 1 |
| canvasco | Canvas & Co | Galerie d'art | ⭐⭐ | Agent 1 |
| fcambition | FC Ambition | Club de foot | ⭐⭐⭐ | Agent 2 |
| urbanthread | UrbanThread | Mode streetwear | ⭐⭐ | Agent 2 |
| lecomptoir | Le Comptoir | Restaurant | ⭐⭐⭐ | Agent 2 |
| greenbox | GreenBox | Livraison repas | ⭐⭐ | Agent 3 |
| streamlab | StreamLab | Studio streaming | ⭐⭐⭐ | Agent 3 |
| petcare | PetCare+ | Animalerie | ⭐⭐ | Agent 3 |

**Problème :** Les 9 thèmes (hors ÉcoVélos) ont été créés rapidement en parallèle. **Des incohérences subsistent.**

---

## 🎯 Ta mission détaillée

### Objectif principal

**Garantir la cohérence absolue** de tous les thèmes selon **7 critères** (voir ci-dessous).

### Méthodologie

1. **Audit exhaustif** ligne par ligne de chaque fichier JSON
2. **Détection** de toutes les incohérences
3. **Correction** directe dans les fichiers JSON sur GitHub
4. **Documentation** de chaque changement dans `AUDIT-OPUS-[THEME].md`
5. **Validation** par build réussi (`npm run build`)

### Livrables

- **9 fichiers** `AUDIT-OPUS-[THEME].md` (un par thème audité)
- **1 synthèse** `AUDIT-OPUS-FINAL.md` (récapitulatif global)
- **Commits GitHub** avec descriptions claires des corrections

---

## 📏 Critères de cohérence (7 règles absolues)

### ✅ Critère 1 : Salaires = 3000€/employé PARTOUT

**Règle :** Chaque employé coûte **exactement 3000€/mois**.

**À vérifier :**

```json
// initial.monthlyCosts.salaries DOIT être = initial.employees × 3000
"initial": {
  "employees": 5,
  "monthlyCosts": {
    "salaries": 15000  // ✅ 5 × 3000€
  }
}
```

**Cas spéciaux :**
- **Recrutement** → `newHires: 2` ajoute automatiquement 6000€ aux salaires
- **Augmentation 10%** → `monthlyIncrease` calculé depuis salaires actuels (ex: 15000 × 1.1 = 16500€)
- **Phase 3 currentSituation** → salaires = employees × 3000€ (RESET complet)

**Erreurs fréquentes :**
- ❌ `monthlyIncrease: 3000` sans `newHires` (ambiguïté)
- ❌ Phase 3 salaires ≠ employees × 3000

---

### ✅ Critère 2 : Phase 3 = TIME SKIP complet

**Règle :** Phase 3 simule **18 mois plus tard**. Les coûts sont **recalculés de zéro**, pas cumulés.

**À vérifier :**

```json
"phases": [
  { "id": 3, "currentSituation": {
    "monthlyRevenue": 50000,
    "employees": 10,
    "budget": 80000,
    "monthlyVA": 18000  // DOIT être < monthlyRevenue
  }}
]
```

**Validation mathématique :**

```
Coûts cibles = monthlyRevenue - monthlyVA
Salaires = employees × 3000

OBLIGATOIRE : Salaires < Coûts cibles
```

**Exemple d'erreur critique :**
```
❌ CA 34k€ - VA 18k€ = Coûts 16k€
   Mais Salaires = 10 × 3000 = 30k€
   → IMPOSSIBLE (30k > 16k)
```

**Fix :**
```
✅ Augmenter CA ou réduire VA pour que Coûts > Salaires
```

---

### ✅ Critère 3 : Effets → Variables réelles

**Règle :** Chaque option doit impacter des **variables réelles** du jeu.

**Variables reconnues :**
```typescript
budget (number)
employees (number)
monthlyRevenue (number)
monthlyCosts.* (salaries, materials, rent, maintenance, etc.)
employeeSatisfaction (number)
customerSatisfaction (number)
reputation (number)
economicScore (number)
socialScore (number)
environmentalScore (number)
```

**À vérifier :**

```json
// ✅ BON : Effets clairs
"effects": {
  "monthlyRevenue": 1500,
  "customerSatisfaction": 10,
  "economicScore": 5
}

// ❌ MAUVAIS : Effets fantômes
"effects": {
  "quality": "premium",  // ❌ Variable inexistante
  "brandImage": "good"   // ❌ Variable inexistante
}
```

**Effets calculés automatiquement :**
- `cost` → réduit `budget` immédiatement
- `monthlyIncrease` → augmente `monthlyCosts.salaries`
- `newHires` → augmente `employees` ET ajoute (newHires × 3000) aux salaires

---

### ✅ Critère 4 : Pas de champs spécifiques ÉcoVélos

**Règle :** Seul `game-data.json` (ÉcoVélos) peut avoir `fleet`, `utilizationRate`, `vandalism`.

**À vérifier :**

```json
// ❌ ERREUR dans Iron Fist
"initial": {
  "fleet": 80,  // ❌ Spécifique vélos
  "monthlyCosts": {
    "vandalism": 2000  // ❌ Spécifique vélos
  }
}
```

**Champs autorisés pour tous :**
```
budget, employees, monthlyRevenue
monthlyCosts.salaries (obligatoire)
monthlyCosts.materials, maintenance, rent, insurance, marketing
employeeSatisfaction, customerSatisfaction, reputation
```

**Champs spécifiques par secteur :**
- **Cosmétiques** → `certificationFees`, `logistics`, `packaging`
- **Boxe** → `equipment`, `utilities`, `maintenance`
- **Restaurant** → `foodWaste`, `ingredients`
- **Livraison** → `delivery`, `packaging`
- **Streaming** → `software`, `internet`, `streamerCuts`
- etc.

---

### ✅ Critère 5 : Textes cohérents avec le secteur

**Règle :** Chaque décision doit être **100% cohérente** avec le secteur du thème.

**Erreurs à détecter :**

```json
// ❌ ERREUR : Iron Fist (boxe) parle de vélos
"label": "Améliorer la qualité des vélos"

// ✅ CORRECT
"label": "Améliorer la qualité des équipements"
```

**Vocabulaire à vérifier :**

| Thème | Vocabulaire attendu | Vocabulaire INTERDIT |
|-------|---------------------|----------------------|
| Iron Fist | salle, ring, équipements, coachs, membres | vélo, produits, articles |
| LuxeGlow | crèmes, sérums, certifications, ingrédients | vélos, équipements sportifs |
| Canvas & Co | tableaux, artistes, vernissage, exposition | produits, vélos, salles |
| Le Comptoir | cuisine, chef, menu, ingrédients, déchets | vélos, équipements, produits |

**Attention aux copier-coller :**
- Vérifier que les noms propres correspondent au thème
- Vérifier que les KPIs mentionnés existent (pas "taux d'utilisation" dans un restaurant)

---

### ✅ Critère 6 : Structure JSON valide

**Règle :** Respect strict de la structure TypeScript.

**À vérifier :**

```typescript
// types.ts
interface GameData {
  theme: { id, name, icon, subtitle, description }
  initial: { budget, employees, monthlyRevenue, monthlyCosts, ... }
  phases: Phase[]
  badEnding: { title, description, consequences }
  scoring: { economicWeight, socialWeight, environmentalWeight }
}

interface Phase {
  id: number
  title: string
  context: string
  decisions: Decision[]
  currentSituation?: CurrentSituation  // Phase 3 uniquement
}

interface Decision {
  title: string
  options: Option[]
}

interface Option {
  label: string
  cost?: number
  monthlyIncrease?: number
  newHires?: number
  delay?: number
  effects: {
    budget?: number
    employees?: number
    monthlyRevenue?: number
    // ... (voir types.ts pour la liste complète)
  }
  consequence: string
  successRate?: number  // Phase 2 uniquement
}
```

**Erreurs fréquentes :**
- ❌ Champ manquant (ex: `context` absent)
- ❌ Type incorrect (ex: `employees: "5"` au lieu de `5`)
- ❌ Champ supplémentaire non défini

---

### ✅ Critère 7 : Gameplay équilibré

**Règle :** Le jeu doit être **jouable** et **pédagogiquement pertinent**.

**À vérifier :**

**Budget :**
```
Budget initial ≥ 50 000€
Budget Phase 3 ≥ 80 000€ (après time skip)
```

**CA mensuel :**
```
Phase 1: 4 000€ - 20 000€
Phase 3: 30 000€ - 150 000€ (croissance cohérente)
```

**VA :**
```
VA Phase 3 ≥ 10 000€ (sinon jeu trop difficile)
VA/CA ≈ 25-40% (ratio réaliste)
```

**Difficultés :**
- ⭐⭐ Facile : Budget confortable, décisions claires
- ⭐⭐⭐ Difficile : Budget serré, dilemmes complexes

**Options :**
```
cost ≤ budget initial × 0.8 (sinon instant game over)
monthlyIncrease raisonnable (pas +50% d'un coup)
successRate cohérent avec la difficulté (50-80% généralement)
```

---

## 🔍 Checklist d'audit par thème

### Étape 1 : Métadonnées

```json
"theme": {
  "id": "luxeglow",  // ✅ Unique
  "name": "LuxeGlow",  // ✅ Cohérent
  "subtitle": "Cosmétiques & beauté",  // ✅ Descriptif
  "description": "...",  // ✅ Contexte clair
  "difficulty": 3  // ✅ 2 ou 3
}
```

**Vérifier :**
- ✅ `id` en minuscules, unique
- ✅ `name` avec majuscule
- ✅ `subtitle` décrit le secteur
- ✅ `description` engageante et cohérente
- ✅ `difficulty` entre 2 et 3

---

### Étape 2 : État initial

```json
"initial": {
  "budget": 80000,
  "employees": 2,
  "monthlyRevenue": 9000,
  "monthlyCosts": {
    "salaries": 6000,  // ✅ 2 × 3000€
    "materials": 2000,
    "rent": 1500,
    // ...
  },
  "employeeSatisfaction": 70,
  "customerSatisfaction": 50,
  "reputation": 40
}
```

**Checklist :**
- [ ] `salaries = employees × 3000`
- [ ] Budget ≥ 50 000€
- [ ] CA mensuel cohérent avec le secteur
- [ ] Coûts < CA (VA positive)
- [ ] Pas de champs ÉcoVélos (`fleet`, `utilizationRate`, `vandalism`)
- [ ] Satisfaction/reputation entre 0-100

---

### Étape 3 : Phase 1 (3 décisions)

**Structure attendue :**
```json
{
  "id": 1,
  "title": "Phase 1 : Le Lancement (Mois 1-3)",
  "context": "...",  // ≥ 100 caractères
  "decisions": [
    { "title": "Décision 1 : ...", "options": [A, B, C] },
    { "title": "Décision 2 : ...", "options": [A, B, C, D] },
    { "title": "Décision 3 : ...", "options": [A, B, C] }
  ]
}
```

**Checklist pour chaque décision :**
- [ ] `context` présent et contextualisé (≥ 100 caractères)
- [ ] 3-4 options par décision
- [ ] Chaque option a `label`, `consequence`, `effects`
- [ ] `cost` raisonnable (≤ budget × 0.8)
- [ ] `effects` impactent des variables réelles
- [ ] Textes cohérents avec le secteur (pas de copier-coller)

**Erreurs fréquentes :**
- ❌ Context générique ("Votre entreprise démarre")
- ❌ `monthlyIncrease: 3000` sans `newHires`
- ❌ Effets fantômes (`quality`, `brandImage`)

---

### Étape 4 : Phase 2 (1 décision avec risque)

**Structure attendue :**
```json
{
  "id": 2,
  "title": "Phase 2 : Partenariat stratégique (Mois 4-8)",
  "context": "...",  // ≥ 150 caractères, mention du partenaire
  "decisions": [
    {
      "title": "Négociation du partenariat",
      "options": [
        { "label": "Accepter (risqué)", "successRate": 60, ... },
        { "label": "Refuser (sûr)", ... }
      ]
    }
  ]
}
```

**Checklist :**
- [ ] 1 seule décision (partenariat)
- [ ] Option A avec `successRate` (50-80%)
- [ ] Option B sûre (sans `successRate`)
- [ ] Conséquences claires (succès/échec pour A, stable pour B)
- [ ] `context` mentionne le partenaire et l'enjeu

**Erreurs fréquentes :**
- ❌ Plusieurs décisions (doit être 1 seule)
- ❌ `successRate` sur toutes les options (uniquement sur la risquée)
- ❌ Partenaire générique ("Une grande entreprise propose...")

---

### Étape 5 : Phase 3 (3 dilemmes + currentSituation)

**Structure attendue :**
```json
{
  "id": 3,
  "title": "Phase 3 : Dilemmes éthiques (Mois 9-12)",
  "context": "Un an plus tard. [situation actuelle]. Des choix difficiles s'imposent : profit vs valeurs, court-terme vs long-terme.",
  "currentSituation": {
    "monthlyRevenue": 50000,
    "employees": 8,
    "budget": 80000,
    "monthlyVA": 18000,
    "employeeSatisfaction": 60
  },
  "decisions": [
    { "title": "Dilemme 1 : ...", ... },
    { "title": "Dilemme 2 : ...", ... },
    { "title": "Dilemme 3 : ...", ... }
  ]
}
```

**Checklist `currentSituation` :**
- [ ] `monthlyRevenue` cohérent (30k-150k selon secteur)
- [ ] `employees` augmenté vs Phase 1
- [ ] `budget` ≥ 80 000€
- [ ] `monthlyVA` < `monthlyRevenue`
- [ ] **CRITIQUE : Salaires < (monthlyRevenue - monthlyVA)**
  ```
  Salaires = employees × 3000
  Coûts cibles = monthlyRevenue - monthlyVA
  DOIT : Salaires < Coûts cibles
  ```
- [ ] `employeeSatisfaction` présent (0-100)

**Checklist dilemmes :**
- [ ] 3 décisions avec titres "Dilemme 1", "Dilemme 2", "Dilemme 3"
- [ ] Chaque dilemme oppose profit/valeurs, court/long terme
- [ ] Options avec trade-offs clairs (pas de "good ending" évident)
- [ ] Textes éthiquement pertinents (pas simplistes)

**Erreurs fréquentes :**
- ❌ Phase 3 impossible (salaires > coûts cibles)
- ❌ Dilemmes sans vrai dilemme (une option clairement meilleure)
- ❌ `context` trop court ou générique

---

### Étape 6 : Bad ending

```json
"badEnding": {
  "title": "Faillite",
  "description": "Votre [entreprise] a coulé. [raison spécifique au secteur].",
  "consequences": [
    "💸 Dettes : [montant]",
    "[conséquence spécifique 1]",
    "[conséquence spécifique 2]"
  ]
}
```

**Checklist :**
- [ ] Textes cohérents avec le secteur
- [ ] Conséquences réalistes
- [ ] Pas de copier-coller d'un autre thème

---

### Étape 7 : Scoring

```json
"scoring": {
  "economicWeight": 0.4,
  "socialWeight": 0.3,
  "environmentalWeight": 0.3
}
```

**Checklist :**
- [ ] Somme des poids = 1.0
- [ ] Poids cohérents avec le secteur (ex: cosmétiques bio → environmentalWeight plus élevé)

---

## 🛠️ Workflow de correction

### 1. Cloner le repo

```bash
git clone https://github.com/Decayuki/ecovelos-game.git
cd ecovelos-game
```

### 2. Configurer l'accès

```bash
git remote set-url origin https://Decayuki:[TOKEN_FOURNI_PAR_MARC]@github.com/Decayuki/ecovelos-game.git
```

### 3. Auditer un thème

**Lire le fichier :**
```bash
cat ecovelos-game-web/lib/game-data-luxeglow.json | jq '.'
```

**Vérifier avec script :**
```bash
node scripts/audit-theme.js luxeglow
```

### 4. Corriger

**Éditer directement :**
```bash
nano ecovelos-game-web/lib/game-data-luxeglow.json
```

**Ou via script Node.js :**
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ecovelos-game-web/lib/game-data-luxeglow.json', 'utf8'));

// Corrections
data.initial.monthlyCosts.salaries = data.initial.employees * 3000;

fs.writeFileSync('ecovelos-game-web/lib/game-data-luxeglow.json', JSON.stringify(data, null, 2));
```

### 5. Valider

```bash
cd ecovelos-game-web
npm run build
```

**Si build OK :**
```
✓ Compiled successfully
```

**Si erreur :**
```
✗ Type error: ...
```
→ Corriger et rebuilder

### 6. Documenter

**Créer `AUDIT-OPUS-LUXEGLOW.md` :**

```markdown
# 🔍 Audit Opus - LuxeGlow

**Date :** 2026-02-02  
**Status :** ✅ Corrigé et validé  

---

## Problèmes détectés

### 1. Salaires incohérents (initial)
**Ligne :** `initial.monthlyCosts.salaries`  
**Avant :** `5000€`  
**Attendu :** `6000€` (2 employés × 3000€)  
**Correction :** Ajusté à `6000€`

### 2. Phase 3 impossible mathématiquement
**Problème :** Salaires (24 000€) > Coûts cibles (20 000€)  
**Correction :** Augmenté `monthlyRevenue` de 45k à 52k, `monthlyVA` de 15k à 18k  
**Résultat :** Coûts cibles = 34k, salaires = 24k ✅

---

## Validation finale

- ✅ Critère 1 : Salaires OK
- ✅ Critère 2 : Phase 3 OK
- ✅ Critère 3 : Effets OK
- ✅ Critère 4 : Pas de champs ÉcoVélos
- ✅ Critère 5 : Textes cohérents
- ✅ Critère 6 : Structure JSON valide
- ✅ Critère 7 : Gameplay équilibré
- ✅ Build réussi

**Status :** Thème prêt pour production ✅
```

### 7. Commit + Push

```bash
git add -A
git commit -m "fix(opus-luxeglow): salaires incohérents + Phase 3 impossible

- Salaires: 5000€ → 6000€ (2 × 3000€)
- Phase 3: CA 45k→52k, VA 15k→18k (coûts cibles 34k > salaires 24k)
- Build validé ✅"

git push origin main
```

### 8. Répéter pour les 8 autres thèmes

---

## 📊 Synthèse finale

**Après avoir audité les 9 thèmes, créer `AUDIT-OPUS-FINAL.md` :**

```markdown
# 🏁 Audit Opus - Synthèse finale

**Date :** 2026-02-02  
**Agent :** Opus  
**Mission :** Analyse approfondie et correction des incohérences  

---

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Thèmes audités | 9/9 |
| Erreurs détectées | 47 |
| Corrections appliquées | 47 |
| Builds réussis | 9/9 |

---

## Erreurs par catégorie

| Catégorie | Nombre |
|-----------|--------|
| Salaires incohérents | 12 |
| Phase 3 impossible | 4 |
| Références croisées | 8 |
| Effets fantômes | 6 |
| Textes copier-coller | 11 |
| Champs ÉcoVélos | 3 |
| Structure JSON | 3 |

---

## Thèmes corrigés (détail)

### LuxeGlow
- 5 erreurs corrigées
- Status: ✅ Prêt

### Iron Fist
- 7 erreurs corrigées
- Status: ✅ Prêt

[... pour chaque thème]

---

## Garantie de cohérence

✅ **Les 7 critères sont respectés pour tous les thèmes.**

- ✅ Critère 1 : Salaires = 3000€/employé partout
- ✅ Critère 2 : Phase 3 = TIME SKIP complet
- ✅ Critère 3 : Effets → Variables réelles
- ✅ Critère 4 : Pas de champs ÉcoVélos ailleurs
- ✅ Critère 5 : Textes cohérents avec secteurs
- ✅ Critère 6 : Structure JSON valide
- ✅ Critère 7 : Gameplay équilibré

---

## Recommandations

### Tests à effectuer

1. **Playtest complet** de chaque thème (3 phases)
2. **Vérification scores finaux** (cohérence des poids)
3. **Test mobile** (responsive design)

### Bugs code détectés (optionnel)

[Si tu détectes des bugs dans le code TypeScript, les lister ici]

---

## Conclusion

**Mission accomplie.** ✅

Les 10 thèmes sont maintenant **100% cohérents** et prêts pour utilisation en classe.

**Signature :** Agent Opus, 2026-02-02
```

---

## 🚨 Cas d'urgence

### Build qui échoue après correction

```bash
cd ecovelos-game-web
npm run build

# Si erreur TypeScript
npm run type-check
```

**Erreurs fréquentes :**
- Virgule manquante/en trop
- Guillemets non fermés
- Type incorrect (string au lieu de number)

**Solution :**
```bash
# Vérifier JSON valide
cat lib/game-data-luxeglow.json | jq '.'
```

### Git push échoue

**Erreur d'authentification :**
```bash
git remote set-url origin https://Decayuki:[TOKEN_FOURNI_PAR_MARC]@github.com/Decayuki/ecovelos-game.git
```

**Conflit de merge :**
```bash
git pull origin main --rebase
git push origin main
```

---

## 📚 Ressources

### Fichiers essentiels

- **`types.ts`** : Définitions TypeScript (structure des données)
- **`calculations.ts`** : Logique de calcul (VA, scores, effets)
- **`page.tsx`** : Logique du jeu (application des décisions)
- **`game-data.json`** : ÉcoVélos (référence)

### Documentation

- **`GUIDE-PEDAGOGIQUE.md`** : Objectifs pédagogiques
- **`CORRECTIONS-FINALES.md`** : Historique des corrections (Sally)
- **`ANALYSE-LIGNE-PAR-LIGNE.md`** : Méthodologie d'audit (ÉcoVélos)
- **`AUDIT-[THEME].md`** : Audits initiaux (sous-agents)

### Liens

- **Repo GitHub :** https://github.com/Decayuki/ecovelos-game
- **App live :** https://ecovelos-game-web.vercel.app
- **TypeScript Handbook :** https://www.typescriptlang.org/docs/handbook/

---

## 🎯 Checklist finale avant livraison

- [ ] Les 9 thèmes ont été audités
- [ ] Les 9 fichiers `AUDIT-OPUS-[THEME].md` sont créés
- [ ] Le fichier `AUDIT-OPUS-FINAL.md` est complet
- [ ] Tous les builds réussissent
- [ ] Tous les commits sont pushés sur GitHub
- [ ] Les 7 critères sont validés pour tous les thèmes

**Quand tout est ✅ → Mission terminée !** 🎉

---

**Bonne chance, Agent Opus. La cohérence du jeu dépend de toi.** 🚀
