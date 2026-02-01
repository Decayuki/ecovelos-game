import { GameState } from './types';

// Détecte si un bad ending doit être déclenché
export const checkBadEnding = (gameState: GameState): { triggered: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Score économique trop bas
  if (gameState.scores.economic < 20) {
    errors.push("Score économique critique (< 20) - Faillite imminente");
  }
  
  // Budget négatif critique
  if (gameState.budget < -50000) {
    errors.push("Dettes insupportables (> 50 000€) - Impossible de continuer");
  }
  
  // Trop de scandales
  if (gameState.scandals && gameState.scandals >= 2) {
    errors.push("Accumulation de scandales (≥2) - Réputation détruite");
  }
  
  // Réputation trop basse
  if (gameState.reputation && gameState.reputation < 10) {
    errors.push("Réputation effondrée (< 10) - Plus personne ne vous fait confiance");
  }
  
  // Risques accumulés (ÉcoVélos et autres thèmes)
  let totalRisk = 0;
  if (gameState.turnoverRisk) totalRisk += gameState.turnoverRisk * 100;
  if (gameState.strikeRisk) totalRisk += gameState.strikeRisk * 100;
  if (gameState.badBuzzRisk) totalRisk += gameState.badBuzzRisk * 100;
  
  if (totalRisk >= 100) {
    const riskReasons = [];
    if (gameState.turnoverRisk && gameState.turnoverRisk >= 0.3) riskReasons.push('démissions massives');
    if (gameState.strikeRisk && gameState.strikeRisk >= 0.4) riskReasons.push('grève prolongée');
    if (gameState.badBuzzRisk && gameState.badBuzzRisk >= 0.25) riskReasons.push('bad buzz viral');
    errors.push(`Crise sociale majeure : ${riskReasons.join(' + ')} - Activité paralysée`);
  }
  
  // Choix spécifiques catastrophiques (fraude, fausse certification, etc.)
  const fatalDecisions = checkFatalDecisions(gameState);
  errors.push(...fatalDecisions);
  
  return {
    triggered: errors.length > 0,
    errors
  };
};

// Vérifie les choix spécifiques qui déclenchent un game over
const checkFatalDecisions = (gameState: GameState): string[] => {
  const errors: string[] = [];
  const decisions = gameState.decisions;
  
  // Fausse certification (Option E dans certification)
  if (decisions['1-certification'] === 'E') {
    errors.push("Fausse certification détectée (Phase 1, Décision 1, Option E)");
  }
  
  // Faux followers détectés (Option E dans influenceur)
  if (decisions['1-influenceur'] === 'E') {
    errors.push("Achat de faux followers détecté (Phase 1, Décision 2, Option E)");
  }
  
  // Scandale fournisseur asiatique (Option C dans fournisseur)
  if (decisions['1-fournisseur'] === 'C') {
    errors.push("Scandale travail des enfants chez fournisseur (Phase 1, Décision 3, Option C)");
  }
  
  // Fraude fiscale (Phase 2)
  if (decisions['2-distributeur'] === 'D') {
    errors.push("Fraude fiscale détectée (Phase 2, Décision 2, Option D)");
  }
  
  // Formule dangereuse causant allergies (Phase 2)
  if (decisions['2-laboratoire'] === 'B') {
    errors.push("Produit dangereux : 20 clientes allergies graves (Phase 2, Décision 3, Option B)");
  }
  
  // Trahison Clara découverte (Phase 2)
  if (decisions['2-investisseur'] === 'D') {
    errors.push("Trahison de Clara découverte - Procès (Phase 2, Décision 4, Option D)");
  }
  
  // Trahison L'Oréal (Phase 3)
  if (decisions['3-loreal'] === 'D') {
    errors.push("Trahison Clara sur vente L'Oréal - Procès médiatisé (Phase 3, Décision 1, Option D)");
  }
  
  // Mensonge licenciement (Phase 3)
  if (decisions['3-employes'] === 'D') {
    errors.push("Mensonge sur licenciements révélé - Scandale médiatique (Phase 3, Décision 2, Option D)");
  }
  
  // Greenwashing chimique (Phase 3)
  if (decisions['3-ingredients'] === 'D') {
    errors.push("Greenwashing chimique + mensonge - Poursuites pénales (Phase 3, Décision 3, Option D)");
  }
  
  return errors;
};

// Calcule les points de scandale basés sur les choix
export const calculateScandals = (gameState: GameState): number => {
  let scandals = 0;
  const decisions = gameState.decisions;
  
  // Auto-certification risquée
  if (decisions['1-certification'] === 'C') scandals += 0.6;
  
  // Fausse certification
  if (decisions['1-certification'] === 'E') scandals += 1;
  
  // Faux followers
  if (decisions['1-influenceur'] === 'E') scandals += 0.7;
  
  // Fournisseur asiatique
  if (decisions['1-fournisseur'] === 'C') scandals += 0.4;
  
  // Formule dangereuse
  if (decisions['2-laboratoire'] === 'B') scandals += 0.5;
  
  // Fraude fiscale
  if (decisions['2-distributeur'] === 'D') scandals += 1;
  
  // Greenwashing chimique
  if (decisions['3-ingredients'] === 'A') scandals += 0.7;
  
  // Greenwashing + mensonge
  if (decisions['3-ingredients'] === 'D') scandals += 1;
  
  return Math.floor(scandals);
};

// Calcule la réputation basée sur les choix
export const calculateReputation = (gameState: GameState): number => {
  let reputation = 50; // Base
  const decisions = gameState.decisions;
  
  // Certifications
  if (decisions['1-certification'] === 'A') reputation += 40;
  if (decisions['1-certification'] === 'B') reputation += 25;
  if (decisions['1-certification'] === 'C') reputation -= 10;
  if (decisions['1-certification'] === 'D') reputation += 15;
  if (decisions['1-certification'] === 'E') reputation -= 50;
  
  // Marketing
  if (decisions['1-influenceur'] === 'A') reputation += 30;
  if (decisions['1-influenceur'] === 'C') reputation += 20;
  if (decisions['1-influenceur'] === 'E') reputation -= 40;
  
  // Fournisseur
  if (decisions['1-fournisseur'] === 'A') reputation += 40;
  if (decisions['1-fournisseur'] === 'B') reputation += 25;
  if (decisions['1-fournisseur'] === 'C') reputation -= 30;
  
  // Distribution
  if (decisions['1-distribution'] === 'B') reputation += 40;
  
  // Scandales Phase 2
  if (decisions['2-laboratoire'] === 'B') reputation -= 50;
  if (decisions['2-distributeur'] === 'D') reputation -= 60;
  
  // Scandales Phase 3
  if (decisions['3-ingredients'] === 'A') reputation -= 40;
  if (decisions['3-ingredients'] === 'D') reputation -= 70;
  if (decisions['3-loreal'] === 'D') reputation -= 50;
  if (decisions['3-employes'] === 'D') reputation -= 40;
  
  return Math.max(0, Math.min(100, reputation));
};
