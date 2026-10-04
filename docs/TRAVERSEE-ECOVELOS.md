# Traversée ÉcoVélos (démo SenseNova `sn-motion-html`)

ÉcoVélos se joue en **traversée continue pilotée par le défilement** ; les 9 autres secteurs gardent
le parcours par cartes en attendant validation de la démo. Principes repris de
[SenseNova sn-motion-html](https://github.com/OpenSenseNova/SenseNova-Skills/blob/main/docs/sn-motion-html.md) (MIT) :
une seule scène fixe plein écran, une piste unique `scène → connecteur → scène`, chapitres décrits
dans `content/story.json`, copie transparente (preset « folio »), repli mouvement réduit et média manquant.
Pas de vidéo (Seedance non disponible) : les connecteurs sont des plongées caméra entre stills.

## Ce qui ne change pas

- Moteur et pédagogie : `lib/calculations.ts`, `lib/bad-ending-logic.ts`, données `lib/game-data*.json`.
  La validation de phase est extraite telle quelle dans `lib/engine.ts`, partagée par les deux parcours ;
  `tests/engine.test.mjs` la compare à une copie verbatim de l'ancien algorithme sur toutes les parties déterministes.
- Contrat StudyNote : `postMessage({ type: 'GAME_SCORE', score }, '*')`, une fois par partie, à l'écran final.
  **Règle Marc (04/10)** : un bad ending émet `0` (`scoreForStudyNote`) ; le score détaillé reste affiché.

## Architecture

| Fichier | Rôle |
|---|---|
| `content/story.json` | Chapitres (ouverture, 3 phases, bilan), connecteurs, points d'intérêt, pictos, libellés |
| `content/assets.json` | **Point unique de remplacement des visuels** : prompt, palette, statut, chemin de chaque still |
| `lib/story/timeline.ts` | Piste en hauteurs d'écran, localisation, verrous de phase, caméra (pur, testé) |
| `lib/story/assets.ts` | Résolution des stills, interrupteurs de recette `?media=` |
| `components/story/StoryExperience.tsx` | Contrôleur : défilement → caméra/copies/légendes (hors React), partie, émission du score |
| `components/story/Dock.tsx` | Panneau d'action posé dans la scène (agenda, décision, validation) |
| `components/story/SceneLayer.tsx`, `ProceduralScene.tsx` | Calque de scène + points d'intérêt ; repli vectoriel |
| `app/story.css` | Interface (bureau, ≤ 760 px, mouvement réduit) |

Mécaniques adaptées : chaque phase = intro → une décision par plan (la caméra cadre le point
d'intérêt) → validation. On ne traverse un connecteur qu'après validation ; remonter rejoue la
traversée en lecture seule. Le panneau se place à l'opposé du point d'intérêt (bureau) ou en bas (mobile).
Sur bad ending, les phases non jouées disparaissent et le connecteur « Tout s'effondre » mène au bilan.

## Visuels (GPT)

Les 5 stills ÉcoVélos sont générés par la génération d'images GPT (outil `image_gen` de Codex CLI,
compte ChatGPT, aucune clé dans le dépôt), livrés en WebP 1600 px ≤ 260 Ko sous `public/story/ecovelos/`.
Les 45 stills des autres secteurs sont déjà décrits (`status: "pending"`) :

```bash
node scripts/assets/generate-gpt.mjs <secteur|all> [--only 01-lancement] [--force] [--jobs 3]
```

Le script n'écrit que `public/story/**` et `content/assets.json` : aucun code à toucher.
Remplacement manuel : déposer le WebP au chemin `src` et passer `status` à `ready`.

## Recette

- `npm test` (données + score + moteur + scènes), `npx tsc --noEmit`, `npm run build`.
- `?media=off` force le repli procédural, `?media=broken` casse les URLs (repli sur erreur réelle),
  `?motion=reduce` force le mouvement réduit (en plus de `prefers-reduced-motion`).
