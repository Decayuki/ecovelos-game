// Le moteur extrait (lib/engine.ts) doit rendre exactement ce que rendait l'ancien app/page.tsx.
// Référence : copie verbatim de l'algorithme de handleValidatePhase (commit 81e7de0), sans React.
import test from 'node:test';
import assert from 'node:assert/strict';
import ecovelos from '../lib/game-data.json' with { type: 'json' };
import luxeglow from '../lib/game-data-luxeglow.json' with { type: 'json' };
import { createInitialState, validatePhase } from '../lib/engine.ts';
import { applyDecisionEffects, calculateGlobalScore } from '../lib/calculations.ts';
import { checkBadEnding, calculateScandals, calculateReputation } from '../lib/bad-ending-logic.ts';
import { scoreForStudyNote } from '../lib/game-score.ts';

console.log = () => {}; // calculations.ts journalise chaque effet

function legacyValidate(gameState, phases, pendingDecisions, selectedTheme) {
  const currentPhase = phases[gameState.currentPhase];
  let newState = { ...gameState, decisions: { ...gameState.decisions } };
  currentPhase.decisions.forEach(decision => {
    const selectedOptionId = pendingDecisions[decision.id];
    if (selectedOptionId) {
      const option = decision.options.find(opt => opt.id === selectedOptionId);
      if (option) {
        newState = applyDecisionEffects(newState, decision.id, selectedOptionId, option);
        newState.decisions[`${currentPhase.id}-${decision.id}`] = selectedOptionId;
      }
    }
  });
  if (selectedTheme === 'cosmetique') {
    newState.scandals = calculateScandals(newState);
    newState.reputation = calculateReputation(newState);
  }
  const monthsToSimulate = 3;
  const totalCosts = Object.values(newState.monthlyCosts).filter(v => v !== undefined).reduce((sum, cost) => sum + cost, 0);
  const budgetChange = (newState.monthlyRevenue - totalCosts) * monthsToSimulate;
  newState.budget += budgetChange;
  const badEndingCheck = checkBadEnding(newState);
  if (badEndingCheck.triggered) { newState.badEnding = true; return { kind: 'badEnding', state: newState, errors: badEndingCheck.errors }; }
  if (newState.currentPhase < phases.length - 1) {
    newState.currentPhase++;
    const nextPhase = phases[newState.currentPhase];
    if (nextPhase.currentSituation) {
      if (nextPhase.currentSituation.employees !== undefined) {
        newState.employees = nextPhase.currentSituation.employees;
        newState.monthlyCosts.salaries = nextPhase.currentSituation.employees * 3000;
      }
      if (nextPhase.currentSituation.monthlyRevenue !== undefined) newState.monthlyRevenue = nextPhase.currentSituation.monthlyRevenue;
      if (nextPhase.id === 3 && nextPhase.currentSituation.monthlyVA !== undefined) {
        const otherCosts = newState.monthlyRevenue - nextPhase.currentSituation.monthlyVA - newState.monthlyCosts.salaries;
        newState.monthlyCosts = {
          salaries: newState.monthlyCosts.salaries,
          materials: Math.round(otherCosts * 0.35), maintenance: Math.round(otherCosts * 0.20), rent: Math.round(otherCosts * 0.15),
          insurance: Math.round(otherCosts * 0.10), marketing: Math.round(otherCosts * 0.10), vandalism: Math.round(otherCosts * 0.10),
        };
      }
      if (nextPhase.currentSituation.budget !== undefined) newState.budget = Math.max(newState.budget, nextPhase.currentSituation.budget);
      if (nextPhase.currentSituation.employeeSatisfaction !== undefined) newState.employeeSatisfaction = nextPhase.currentSituation.employeeSatisfaction;
    }
    return { kind: 'next', state: newState, budgetChange, totalCosts };
  }
  return { kind: 'finished', state: newState };
}

// Combinaisons sans tirage aléatoire (successRate) : comparables à l'identique.
const combos = (phase) => phase.decisions.reduce(
  (acc, d) => acc.flatMap((c) => d.options.filter((o) => o.successRate === undefined).map((o) => ({ ...c, [d.id]: o.id }))), [{}]);

function playBoth(data, themeId, plan) {
  let mine = createInitialState(themeId, data.initial);
  let ref = structuredClone(mine);
  for (const pending of plan) {
    const a = validatePhase(mine, data.phases, pending);
    const b = legacyValidate(ref, data.phases, pending, themeId);
    assert.equal(a.kind, b.kind);
    const strip = ({ scores, ...rest }) => rest; // l'ancien écran recalculait les scores en effet différé
    assert.deepEqual(strip(a.state), strip(b.state));
    if (a.kind === 'badEnding') assert.deepEqual(a.fatalErrors, b.errors);
    if (a.kind === 'next') {
      assert.equal(a.transition.budgetChange, b.budgetChange);
      assert.equal(a.transition.monthlyCosts, b.totalCosts);
    }
    if (a.kind !== 'next') return a;
    mine = a.state; ref = b.state;
  }
  throw new Error('partie non terminée');
}

test('ÉcoVélos : moteur identique à l’ancien écran sur toutes les parties déterministes', () => {
  const [p1, p2, p3] = ecovelos.phases.map(combos);
  let count = 0;
  for (const a of p1) for (const b of p2) for (const c of p3) { playBoth(ecovelos, 'ecovelos', [a, b, c]); count++; }
  assert.equal(count, p1.length * p2.length * p3.length);
  assert.ok(count >= 972);
});

test('LuxeGlow (scandales/réputation) : moteur identique sur un échantillon', () => {
  const [p1, p2, p3] = luxeglow.phases.map(combos);
  for (const a of p1.slice(0, 12)) for (const b of p2.slice(0, 6)) playBoth(luxeglow, 'cosmetique', [a, b, p3[0]]);
});

test('parcours de référence : bilan à 92 ; bad ending (dettes) à 72 émis 0', () => {
  const plan = (s) => s.split('|').map((part, i) => Object.fromEntries(ecovelos.phases[i].decisions.map((d, j) => [d.id, part[j]])));
  const win = playBoth(ecovelos, 'ecovelos', plan('AAA|A|CBB'));
  assert.equal(win.kind, 'finished');
  assert.equal(calculateGlobalScore(win.state), 92);
  assert.equal(scoreForStudyNote(92, false), 92);
  const lose = playBoth(ecovelos, 'ecovelos', plan('AAB|A|CBC'));
  assert.equal(lose.kind, 'badEnding');
  assert.equal(lose.state.badEnding, true);
  assert.match(lose.fatalErrors[0], /Dettes insupportables/);
  assert.equal(calculateGlobalScore(lose.state), 72); // affiché à l'écran
  assert.equal(scoreForStudyNote(calculateGlobalScore(lose.state), true), 0); // envoyé à StudyNote
});

test('time skip de la phase 3 : nouvelle échelle appliquée', () => {
  let s = createInitialState('ecovelos', ecovelos.initial);
  s = validatePhase(s, ecovelos.phases, { security: 'A', maintenance: 'A', acquisition: 'A' }).state;
  const out = validatePhase(s, ecovelos.phases, { partnership: 'A' });
  assert.equal(out.kind, 'next');
  assert.equal(out.state.currentPhase, 2);
  assert.equal(out.state.employees, 12);
  assert.equal(out.state.monthlyRevenue, 60000);
  assert.equal(out.state.monthlyCosts.salaries, 36000);
  assert.equal(out.state.employeeSatisfaction, 40);
  assert.ok(out.state.budget >= 80000);
});

test('la validation ne mute pas l’état d’entrée', () => {
  const s = createInitialState('ecovelos', ecovelos.initial);
  const before = structuredClone(s);
  validatePhase(s, ecovelos.phases, { security: 'C', maintenance: 'C', acquisition: 'C' });
  assert.deepEqual(s, before);
});
