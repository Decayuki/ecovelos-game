import { GameState, MonthlyCosts } from './types';

export function calculateVA(revenue: number, costs: MonthlyCosts): number {
  const totalCosts = Object.values(costs).filter((v): v is number => v !== undefined).reduce((sum, cost) => sum + cost, 0);
  return revenue - totalCosts;
}

export function calculateEconomicScore(state: GameState): number {
  const va = calculateVA(state.monthlyRevenue, state.monthlyCosts);
  let score = 0;
  
  // VA positive et croissante
  if (va > 0) score += 30;
  
  // Rentabilité (VA/CA > 25%)
  if (state.monthlyRevenue > 0) {
    const profitability = va / state.monthlyRevenue;
    if (profitability > 0.25) score += 20;
  }
  
  // Trésorerie saine (> 50k€)
  if (state.budget > 50000) score += 20;
  
  // Croissance CA (simplifié ici, dans le vrai jeu on compare début/fin)
  if (state.monthlyRevenue > 12000) score += 30;
  
  return Math.min(100, score);
}

export function calculateSocialScore(state: GameState): number {
  let score = 0;
  
  // Satisfaction salariés (> 70%)
  if (state.employeeSatisfaction !== undefined) {
    if (state.employeeSatisfaction > 70) score += 30;
    else if (state.employeeSatisfaction > 50) score += 15;
  }
  
  // Salaires décents (ratio salaires/CA)
  if (state.monthlyRevenue > 0) {
    const salaryRatio = state.monthlyCosts.salaries / state.monthlyRevenue;
    if (salaryRatio > 0.4 && salaryRatio < 0.6) score += 20;
  }
  
  // Autres facteurs (simplifiés)
  score += 20; // Conditions de travail
  score += 15; // Partenariats locaux
  
  // Appliquer les modificateurs accumulés par les décisions
  if (state.socialScoreModifier !== undefined) {
    score += state.socialScoreModifier;
  }
  
  // Prendre en compte l'impact image
  if (state.imageModifier !== undefined) {
    score += state.imageModifier / 2; // Impact image compte pour 50% du social
  }
  
  return Math.max(0, Math.min(100, score));
}

export function calculateEnvironmentalScore(state: GameState): number {
  let score = 0;
  
  // Coût matériaux = indicateur sourcing responsable
  const materials = state.monthlyCosts.materials || 0;
  if (materials > 2400) score += 30; // Sourcing éthique
  else if (materials > 2000) score += 15;
  
  // Autres facteurs (simplifiés ici)
  score += 20; // Réduction impact carbone
  score += 20; // Certifications
  score += 15; // Économie circulaire
  
  // Appliquer les modificateurs accumulés par les décisions
  if (state.environmentalScoreModifier !== undefined) {
    score += state.environmentalScoreModifier;
  }
  
  return Math.max(0, Math.min(100, score));
}

export function calculateGlobalScore(state: GameState): number {
  const economic = calculateEconomicScore(state);
  const social = calculateSocialScore(state);
  const environmental = calculateEnvironmentalScore(state);
  
  // Moyenne pondérée : Éco 40%, Social 30%, Enviro 30%
  return Math.round(economic * 0.4 + social * 0.3 + environmental * 0.3);
}

export function getGrading(globalScore: number): {
  label: string;
  description: string;
  color: string;
} {
  if (globalScore < 40) return {
    label: 'Échec',
    description: 'Faillite probable ou scandale',
    color: 'text-red-600'
  };
  if (globalScore < 60) return {
    label: 'Survie difficile',
    description: 'Valeur actionnariale pure',
    color: 'text-orange-600'
  };
  if (globalScore < 75) return {
    label: 'Équilibre fragile',
    description: 'Début d\'équilibre',
    color: 'text-yellow-600'
  };
  if (globalScore < 85) return {
    label: 'Succès ⭐',
    description: 'Bon équilibre partenariale',
    color: 'text-green-600'
  };
  return {
    label: 'Excellence 🏆',
    description: 'Modèle exemplaire',
    color: 'text-emerald-600'
  };
}

export function applyDecisionEffects(state: GameState, decisionId: string, optionId: string, optionData: any): GameState {
  const newState = { 
    ...state,
    monthlyCosts: { ...state.monthlyCosts }
  };
  
  // Gérer les décisions avec successRate (ex: négociation)
  let effectiveData = optionData;
  if (optionData.successRate !== undefined) {
    const roll = Math.random();
    const success = roll < optionData.successRate;
    effectiveData = success ? optionData.ifSuccess : optionData.ifFailure;
    
    // Stocker le résultat pour affichage (optionnel)
    console.log(`Decision ${decisionId} option ${optionId}: ${success ? 'SUCCESS' : 'FAILURE'} (roll: ${roll.toFixed(2)}, rate: ${optionData.successRate})`);
  }
  
  // Appliquer les coûts
  if (effectiveData.cost && !isNaN(effectiveData.cost)) {
    newState.budget -= effectiveData.cost;
  }
  
  if (effectiveData.monthlyIncrease && !isNaN(effectiveData.monthlyIncrease)) {
    const oldSalaries = newState.monthlyCosts.salaries;
    newState.monthlyCosts.salaries += effectiveData.monthlyIncrease;
    console.log(`💰 SALARY INCREASE: ${oldSalaries}€ + ${effectiveData.monthlyIncrease}€ = ${newState.monthlyCosts.salaries}€/mois`);
  }
  
  if (effectiveData.newHires && !isNaN(effectiveData.newHires)) {
    newState.employees += effectiveData.newHires;
    // Augmentation des salaires proportionnelle (salaire moyen ~3000€)
    const additionalSalaries = effectiveData.newHires * 3000;
    newState.monthlyCosts.salaries += additionalSalaries;
    console.log(`New hires: +${effectiveData.newHires} employees → +${additionalSalaries}€/mois salaries`);
  }
  
  // Partenariat : revenue/costs sont annuels, on les répartit mensuellement
  if (effectiveData.revenue && !isNaN(effectiveData.revenue)) {
    // Revenu annuel du contrat → CA mensuel supplémentaire
    const monthlyRevenue = Math.round(effectiveData.revenue / 12);
    newState.monthlyRevenue += monthlyRevenue;
    console.log(`Added monthly revenue: +${monthlyRevenue}€/mois (from ${effectiveData.revenue}€/an)`);
  }
  
  if (effectiveData.productionCost && !isNaN(effectiveData.productionCost)) {
    // Coût de production annuel → coût mensuel matériaux
    const monthlyCost = Math.round(effectiveData.productionCost / 12);
    newState.monthlyCosts.materials = (newState.monthlyCosts.materials || 0) + monthlyCost;
    console.log(`Added monthly materials cost: +${monthlyCost}€/mois (from ${effectiveData.productionCost}€/an)`);
  }
  
  if (effectiveData.maintenanceCost && !isNaN(effectiveData.maintenanceCost)) {
    // Maintenance annuelle → coût mensuel
    const monthlyCost = Math.round(effectiveData.maintenanceCost / 12);
    newState.monthlyCosts.maintenance = (newState.monthlyCosts.maintenance || 0) + monthlyCost;
    console.log(`Added monthly maintenance cost: +${monthlyCost}€/mois (from ${effectiveData.maintenanceCost}€/an)`);
  }
  
  // Appliquer les effets (vérifier que effects existe)
  const effects = effectiveData.effects;
  
  if (effects) {
    if (effects.vandalism !== undefined && !isNaN(effects.vandalism)) {
      newState.monthlyCosts.vandalism = effects.vandalism;
    }
    
    if (effects.maintenanceCost !== undefined && !isNaN(effects.maintenanceCost)) {
      newState.monthlyCosts.maintenance = effects.maintenanceCost;
    }
    
    if (effects.materialCost !== undefined && !isNaN(effects.materialCost)) {
      newState.monthlyCosts.materials = effects.materialCost;
    }
    
    if (effects.growthRate !== undefined && !isNaN(effects.growthRate) && newState.fleet !== undefined && newState.utilizationRate !== undefined) {
      // Augmentation du taux d'utilisation (uniquement pour ÉcoVélos)
      newState.utilizationRate *= (1 + effects.growthRate);
      
      // FORMULE ÉCOVÉLOS : CA mensuel = nombre de vélos × taux d'utilisation × prix/jour × jours/mois
      // Exemple initial : 200 vélos × 30% × 5€/jour × 30 jours = 9 000€/mois
      const pricePerDay = 5; // Prix location par vélo par jour
      const daysPerMonth = 30;
      newState.monthlyRevenue = Math.round(newState.fleet * newState.utilizationRate * pricePerDay * daysPerMonth);
      
      console.log(`📈 Croissance: taux d'utilisation ${(newState.utilizationRate * 100).toFixed(1)}% → CA ${newState.monthlyRevenue}€/mois`);
    }
    
    if (effects.customerSatisfaction !== undefined && !isNaN(effects.customerSatisfaction)) {
      newState.customerSatisfaction += effects.customerSatisfaction;
    }
    
    if (effects.employeeSatisfaction !== undefined && !isNaN(effects.employeeSatisfaction)) {
      newState.employeeSatisfaction = effects.employeeSatisfaction;
    }
    
    // Effets sur scores (HIGH PRIORITY)
    if (effects.socialScore !== undefined && !isNaN(effects.socialScore)) {
      newState.socialScoreModifier = (newState.socialScoreModifier || 0) + effects.socialScore;
      console.log(`Social score modifier: ${effects.socialScore} → Total: ${newState.socialScoreModifier}`);
    }
    
    if (effects.environmentalScore !== undefined && !isNaN(effects.environmentalScore)) {
      newState.environmentalScoreModifier = (newState.environmentalScoreModifier || 0) + effects.environmentalScore;
      console.log(`Environmental score modifier: ${effects.environmentalScore} → Total: ${newState.environmentalScoreModifier}`);
    }
    
    if (effects.imageImpact !== undefined && !isNaN(effects.imageImpact)) {
      newState.imageModifier = (newState.imageModifier || 0) + effects.imageImpact;
      if (newState.reputation !== undefined) {
        newState.reputation = Math.max(0, Math.min(100, newState.reputation + effects.imageImpact));
      }
      console.log(`Image impact: ${effects.imageImpact} → Reputation: ${newState.reputation}`);
    }
    
    // Effets sur risques (HIGH PRIORITY)
    if (effects.turnoverRisk !== undefined && !isNaN(effects.turnoverRisk)) {
      newState.turnoverRisk = (newState.turnoverRisk || 0) + effects.turnoverRisk;
    }
    
    if (effects.strikeRisk !== undefined && !isNaN(effects.strikeRisk)) {
      newState.strikeRisk = (newState.strikeRisk || 0) + effects.strikeRisk;
    }
    
    if (effects.badBuzzRisk !== undefined && !isNaN(effects.badBuzzRisk)) {
      newState.badBuzzRisk = (newState.badBuzzRisk || 0) + effects.badBuzzRisk;
    }
    
    // Effet customerLoss (HIGH PRIORITY) - réduit le CA
    if (effects.customerLoss !== undefined && !isNaN(effects.customerLoss)) {
      const loss = Math.round(newState.monthlyRevenue * effects.customerLoss);
      newState.monthlyRevenue -= loss;
      console.log(`Customer loss: -${(effects.customerLoss * 100).toFixed(0)}% → -${loss}€/mois CA`);
    }
    
    // Effet turnover (MEDIUM PRIORITY) - impact sur satisfaction
    if (effects.turnover !== undefined && !isNaN(effects.turnover) && newState.employeeSatisfaction !== undefined) {
      newState.employeeSatisfaction = Math.max(0, Math.min(100, newState.employeeSatisfaction + effects.turnover * 10));
      console.log(`Turnover impact: ${effects.turnover} → Satisfaction: ${newState.employeeSatisfaction}`);
    }
    
    // Effet productivity (MEDIUM PRIORITY) - augmente CA
    if (effects.productivity !== undefined && !isNaN(effects.productivity)) {
      const oldRevenue = newState.monthlyRevenue;
      newState.monthlyRevenue = Math.round(newState.monthlyRevenue * effects.productivity);
      console.log(`Productivity boost: ×${effects.productivity} → CA: ${oldRevenue}€ → ${newState.monthlyRevenue}€`);
    }
    
    // effects.va est informatif seulement, l'impact réel vient de revenue/productionCost/maintenanceCost
  }
  
  // Recalculer les scores
  newState.scores = {
    economic: calculateEconomicScore(newState),
    social: calculateSocialScore(newState),
    environmental: calculateEnvironmentalScore(newState),
    global: calculateGlobalScore(newState)
  };
  
  return newState;
}
