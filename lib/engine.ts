// Moteur de partie, extrait tel quel de l'ancien app/page.tsx (aucune règle changée) :
// état initial, validation d'une phase (décisions → 3 mois simulés → bad ending → time skip).
// Pur et sans import JSON : testable sous Node (tests/engine.test.mjs).
import type { GameState, Phase } from './types';
import {
  applyDecisionEffects,
  calculateEconomicScore,
  calculateSocialScore,
  calculateEnvironmentalScore,
  calculateGlobalScore,
} from './calculations.ts';
import { checkBadEnding, calculateScandals, calculateReputation } from './bad-ending-logic.ts';

export const MONTHS_PER_PHASE = 3;

export interface PhaseTransition {
  fromPhase: number;
  toPhase: number;
  budgetChange: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  months: number;
}

export type PhaseOutcome =
  | { kind: 'next'; state: GameState; transition: PhaseTransition }
  | { kind: 'finished'; state: GameState }
  | { kind: 'badEnding'; state: GameState; fatalErrors: string[] };

export function createInitialState(themeId: string, initial: Record<string, unknown>): GameState {
  return {
    themeId,
    ...(initial as Partial<GameState>),
    currentPhase: 0,
    decisions: {},
    scores: { economic: 0, social: 50, environmental: 50, global: 0 },
    customerSatisfaction: 50,
    employeeSatisfaction: 50,
    reputation: 50,
    scandals: 0,
    turnoverRisk: 0,
    strikeRisk: 0,
    badBuzzRisk: 0,
    socialScoreModifier: 0,
    environmentalScoreModifier: 0,
    imageModifier: 0,
  } as GameState;
}

export function totalMonthlyCosts(state: GameState): number {
  return Object.values(state.monthlyCosts).filter((v): v is number => v !== undefined).reduce((sum, cost) => sum + cost, 0);
}

export function withScores(state: GameState): GameState {
  return {
    ...state,
    scores: {
      economic: calculateEconomicScore(state),
      social: calculateSocialScore(state),
      environmental: calculateEnvironmentalScore(state),
      global: calculateGlobalScore(state),
    },
  };
}

export function phaseComplete(phase: Phase, pending: Record<string, string>): boolean {
  return phase.decisions.every((decision) => !!pending[decision.id]);
}

export function validatePhase(
  gameState: GameState,
  phases: Phase[],
  pending: Record<string, string>,
): PhaseOutcome {
  const currentPhase = phases[gameState.currentPhase];
  let newState: GameState = { ...gameState, decisions: { ...gameState.decisions } };

  // Appliquer toutes les décisions de la phase
  currentPhase.decisions.forEach((decision) => {
    const selectedOptionId = pending[decision.id];
    if (!selectedOptionId) return;
    const option = decision.options.find((opt) => opt.id === selectedOptionId);
    if (!option) return;
    newState = applyDecisionEffects(newState, decision.id, selectedOptionId, option);
    newState.decisions[`${currentPhase.id}-${decision.id}`] = selectedOptionId;
  });

  // Scandales et réputation : uniquement pour cosmetique (règle d'origine)
  if (gameState.themeId === 'cosmetique') {
    newState.scandals = calculateScandals(newState);
    newState.reputation = calculateReputation(newState);
  }

  // Passage du temps : 3 mois entre chaque phase
  const totalCosts = totalMonthlyCosts(newState);
  const budgetChange = (newState.monthlyRevenue - totalCosts) * MONTHS_PER_PHASE;
  newState.budget += budgetChange;

  // Le bad ending lit les scores calculés à la dernière décision (avant la trésorerie), comme avant.
  const badEndingCheck = checkBadEnding(newState);
  if (badEndingCheck.triggered) {
    return { kind: 'badEnding', state: withScores({ ...newState, badEnding: true }), fatalErrors: badEndingCheck.errors };
  }

  if (newState.currentPhase >= phases.length - 1) {
    return { kind: 'finished', state: withScores(newState) };
  }

  const transition: PhaseTransition = {
    fromPhase: currentPhase.id,
    toPhase: currentPhase.id + 1,
    budgetChange,
    monthlyRevenue: newState.monthlyRevenue,
    monthlyCosts: totalCosts,
    months: MONTHS_PER_PHASE,
  };

  newState.currentPhase++;
  const nextPhase = phases[newState.currentPhase];
  const situation = nextPhase.currentSituation;
  if (situation) {
    // Time skip : l'entreprise a grandi, on RESET l'état opérationnel
    if (situation.employees !== undefined) {
      newState.employees = situation.employees;
      newState.monthlyCosts = { ...newState.monthlyCosts, salaries: situation.employees * 3000 };
    }
    if (situation.monthlyRevenue !== undefined) {
      newState.monthlyRevenue = situation.monthlyRevenue;
    }
    // RESET complet des coûts pour la Phase 3 (nouvelle échelle d'entreprise)
    if (nextPhase.id === 3 && situation.monthlyVA !== undefined) {
      const otherCosts = newState.monthlyRevenue - situation.monthlyVA - newState.monthlyCosts.salaries;
      newState.monthlyCosts = {
        salaries: newState.monthlyCosts.salaries,
        materials: Math.round(otherCosts * 0.35),
        maintenance: Math.round(otherCosts * 0.20),
        rent: Math.round(otherCosts * 0.15),
        insurance: Math.round(otherCosts * 0.10),
        marketing: Math.round(otherCosts * 0.10),
        vandalism: Math.round(otherCosts * 0.10),
      };
    }
    // Budget : le meilleur des deux (seule chose qui persiste vraiment entre phases)
    if (situation.budget !== undefined) {
      newState.budget = Math.max(newState.budget, situation.budget);
    }
    if (situation.employeeSatisfaction !== undefined) {
      newState.employeeSatisfaction = situation.employeeSatisfaction;
    }
  }

  return { kind: 'next', state: withScores(newState), transition };
}
