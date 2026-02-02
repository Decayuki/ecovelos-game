# 🎯 README FIRST - Mission Agent Opus

**Dernière mise à jour :** 2026-02-02

---

## 📍 Ton rôle

Tu es **Agent Opus**, chargé d'une **analyse approfondie et correction des incohérences** dans le serious game pédagogique "Gestion & Valeur Partenariale".

Le jeu comporte **10 thèmes d'entreprise** (ÉcoVélos, LuxeGlow, Iron Fist, etc.). Chaque thème a été créé rapidement par 3 agents en parallèle. **Des incohérences subsistent.**

---

## 🎯 Ta mission

**Objectif :** Garantir la **cohérence absolue** de tous les thèmes.

**Méthodologie :**
1. **Audit exhaustif** ligne par ligne de chaque thème
2. **Détecter** toutes les incohérences (calculs, textes, gameplay)
3. **Corriger** directement sur GitHub
4. **Documenter** chaque correction dans `AUDIT-OPUS.md`

**Tu travailles sur GitHub, pas en local.**

---

## 📂 Accès au projet

**Repository GitHub :**
```
https://github.com/Decayuki/ecovelos-game
```

**Fichiers de données (9 thèmes à auditer) :**
```
ecovelos-game-web/lib/game-data-luxeglow.json
ecovelos-game-web/lib/game-data-ironfist.json
ecovelos-game-web/lib/game-data-canvasco.json
ecovelos-game-web/lib/game-data-fcambition.json
ecovelos-game-web/lib/game-data-urbanthread.json
ecovelos-game-web/lib/game-data-lecomptoir.json
ecovelos-game-web/lib/game-data-greenbox.json
ecovelos-game-web/lib/game-data-streamlab.json
ecovelos-game-web/lib/game-data-petcare.json
```

**ÉcoVélos** (`game-data.json`) est le thème de référence - déjà audité et corrigé.

---

## 📋 Documents à lire ABSOLUMENT

### 1. **MISSION-OPUS.md** (ce document)
Ton brief complet : règles, critères de cohérence, exemples d'erreurs.

### 2. **GUIDE-PEDAGOGIQUE.md**
Comprendre les objectifs pédagogiques et la structure du jeu.

### 3. **CORRECTIONS-FINALES.md**
Historique des corrections déjà effectuées (pour éviter de les refaire).

### 4. **ANALYSE-LIGNE-PAR-LIGNE.md**
Méthodologie d'audit ligne par ligne (exemple sur ÉcoVélos).

### 5. **AUDIT-[THEME].md** (9 fichiers)
Audits initiaux des sous-agents (incomplets, à vérifier).

---

## 🔑 Accès GitHub

**Token d'accès fourni par Marc :**
```
[TOKEN_FOURNI_PAR_MARC]
```

**Commandes pour push tes corrections :**

```bash
# 1. Récupérer le repo
git clone https://github.com/Decayuki/ecovelos-game.git
cd ecovelos-game

# 2. Configurer Git avec le token
git remote set-url origin https://Decayuki:[TOKEN_FOURNI_PAR_MARC]@github.com/Decayuki/ecovelos-game.git

# 3. Après tes corrections
git add -A
git commit -m "fix(opus): [description de tes corrections]"
git push origin main
```

---

## 📊 Livrables attendus

### Pendant l'audit

Pour **chaque thème audité**, tu créeras/mettras à jour :

**`AUDIT-OPUS-[THEME].md`** avec :
- ✅ Sections vérifiées (initial state, décisions, Phase 3, etc.)
- ❌ Problèmes détectés (avec ligne/section)
- 🔧 Corrections appliquées (avant/après)
- ✅ Validation finale

### À la fin de la mission

**`AUDIT-OPUS-FINAL.md`** récapitulatif :
- Nombre total d'erreurs détectées par catégorie
- Thèmes les plus problématiques
- Garantie de cohérence globale
- Recommandations (si besoin de tests supplémentaires)

---

## ⏱️ Workflow recommandé

1. **Lis `MISSION-OPUS.md`** en entier (règles, critères, exemples)
2. **Commence par 1 thème test** (ex: LuxeGlow) pour te familiariser
3. **Audit exhaustif** ligne par ligne
4. **Corrige + Commit + Push**
5. **Documente** dans `AUDIT-OPUS-[THEME].md`
6. **Répète** pour les 8 autres thèmes
7. **Synthèse finale** dans `AUDIT-OPUS-FINAL.md`

---

## 🚨 Règles critiques

### ❌ Ne JAMAIS modifier :
- `game-data.json` (ÉcoVélos - thème de référence)
- `types.ts`, `calculations.ts`, `page.tsx` (sauf bug bloquant)
- Les noms de thèmes, IDs, structure JSON

### ✅ Tu DOIS corriger :
- Incohérences de calcul (salaires, VA, coûts)
- Références croisées incorrectes (vélo dans Iron Fist, etc.)
- Phase 3 impossible mathématiquement
- Textes génériques/copier-coller
- Effets d'options incohérents

### 🔄 Après chaque correction :
```bash
npm run build  # Vérifier que le build passe
```

---

## 💬 Communication

Si tu détectes un **bug dans le code TypeScript** (pas juste les données JSON), documente-le dans `AUDIT-OPUS-FINAL.md` section "Bugs code".

**Contact :** Marc (@yukimurra sur Discord #sgn)

---

## 🎯 Résultat attendu

À la fin de ta mission :
- ✅ **10 thèmes** parfaitement cohérents et jouables
- ✅ **Build TypeScript** qui passe sans erreur
- ✅ **Documentation complète** de tous les changements
- ✅ **Zero incohérence** mathématique ou narrative

**Bonne chance, Agent Opus ! Le jeu compte sur toi.** 🚀

---

## 📌 Liens rapides

- **Repo GitHub :** https://github.com/Decayuki/ecovelos-game
- **App live :** https://ecovelos-game-web.vercel.app
- **Mission détaillée :** Lire `MISSION-OPUS.md`
- **Guide pédagogique :** Lire `GUIDE-PEDAGOGIQUE.md`
