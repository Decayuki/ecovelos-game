/**
 * Script de correction exhaustif - 9 thèmes
 * Agent Opus - 2026-02-02
 *
 * Convertit les effets fantômes vers des effets réels reconnus par calculations.ts
 */

const fs = require('fs');
const path = require('path');

// Mapping des effets fantômes vers effets réels
const EFFECT_MAPPING = {
  // === Satisfaction client ===
  'artistSatisfaction': 'customerSatisfaction', // galerie
  'streamerSatisfaction': 'customerSatisfaction', // streaming
  'playerSatisfaction': 'customerSatisfaction', // foot
  'staffSatisfaction': 'employeeSatisfaction',

  // === Image / Réputation ===
  'brandIdentity': 'imageImpact',
  'brandControl': 'imageImpact',
  'brandImage': 'imageImpact',
  'brandAwareness': 'imageImpact',
  'brandValue': 'imageImpact',
  'brandVisibility': 'imageImpact',
  'brandDifferentiation': 'imageImpact',
  'brandDilution': (v) => ({ imageImpact: typeof v === 'number' ? -v : -15 }),
  'brandIntegrity': 'imageImpact',
  'localReputation': 'imageImpact',
  'industryReputation': 'imageImpact',
  'visibility': 'imageImpact',
  'videoQuality': null, // ignoré
  'networkQuality': null, // ignoré
  'reach': null, // ignoré

  // === Scores environnementaux ===
  'ethicalScore': 'environmentalScore',
  'sustainability': 'environmentalScore',
  'localSourcing': 'environmentalScore',
  'foodWaste': (v) => {
    // Si c'est un coût, ignorer. Si c'est un score, mapper vers environnemental
    return typeof v === 'number' && v < 100 ? { environmentalScore: -Math.round(v / 100) } : null;
  },
  'carbonReduction': 'environmentalScore',
  'animalWelfare': (v) => {
    if (v === 'exceptionnelle' || v === 'excellente') return { environmentalScore: 30, socialScore: 20 };
    if (v === 'faible' || v === 'discutable') return { environmentalScore: -20, socialScore: -15 };
    if (typeof v === 'number') return { environmentalScore: v };
    return null;
  },

  // === Scores sociaux ===
  'socialImpact': 'socialScore',
  'fairness': 'socialScore',
  'inclusivity': 'socialScore',
  'communityImpact': 'socialScore',
  'communityEngagement': 'socialScore',
  'communityIntegration': 'socialScore',
  'communityBuilding': 'socialScore',
  'communityLeadership': 'socialScore',
  'communityStrength': 'socialScore',
  'communityRespect': 'socialScore',
  'localTies': 'socialScore',
  'localIdentity': 'socialScore',
  'localEconomy': 'socialScore',
  'youthDevelopment': 'socialScore',
  'youthEngagement': 'socialScore',
  'employmentLocal': 'socialScore',
  'ecosystemSupport': 'socialScore',

  // === Risques ===
  'burnout': (v) => ({ turnoverRisk: typeof v === 'number' ? v : 0.3 }),
  'injuryRisk': 'turnoverRisk',
  'relegationRisk': null, // spécifique foot, ignorer
  'sanctionRisk': null, // ignorer
  'lawsuit': 'badBuzzRisk',
  'socialMediaCrisis': (v) => ({ badBuzzRisk: 0.5 }),
  'ethicalRisk': 'badBuzzRisk',
  'scandalRisk': 'badBuzzRisk',
  'churnRisk': 'customerLoss',
  'tensions': (v) => ({ badBuzzRisk: typeof v === 'number' ? v : 0.2 }),
  'sponsorLoss': 'customerLoss',
  'platformRisk': null, // ignorer

  // === Performance ===
  'creativity': (v) => ({ productivity: typeof v === 'number' && v > 1 ? v : 1.1 }),
  'performance': (v) => {
    if (v === 'excellente') return { productivity: 1.2 };
    if (v === 'bonne') return { productivity: 1.1 };
    return null;
  },
  'consistency': null, // ignorer
  'retention': (v) => ({ turnoverRisk: typeof v === 'number' ? -v / 100 : -0.2 }),
  'wellBeing': 'employeeSatisfaction',
  'motivation': 'employeeSatisfaction',
  'morale': (v) => ({ employeeSatisfaction: typeof v === 'number' ? v : 0 }),
  'teamMorale': (v) => ({ employeeSatisfaction: typeof v === 'number' ? v : -20 }),

  // === Effets économiques (informatifs, ignorés) ===
  'va': null, // valeur ajoutée informative
  'margins': null,
  'profitability': null,
  'cashFlow': null,
  'cashBurn': null,
  'investment': null,
  'revenue': null,
  'monthlyRevenue': null, // géré ailleurs
  'monthlySavings': null,
  'revenueGrowth': null,
  'growth': null,
  'profitShortTerm': null,
  'revenueShortTerm': null,
  'shortTermCash': null,
  'shortTermRevenue': null,

  // === Effets à ignorer (ne font pas sens comme effets) ===
  'opportunity': null,
  'positioning': null,
  'priceRange': null,
  'salesVolume': null,
  'diversity': null,
  'authenticity': null,
  'commissionRate': null,
  'competitiveness': null,
  'integrity': null,
  'workQuality': null,
  'eventQuality': null,
  'rent': null,
  'expulsion': null,
  'ownership': null,
  'legalRisk': null,
  'legalProtection': null,
  'production': null,
  'deliveryTime': null,
  'materials': null, // géré via monthlyCostChange
  'ingredients': null, // géré via monthlyCostChange
  'packaging': null, // géré via monthlyCostChange
  'delivery': null, // géré via monthlyCostChange
  'equipment': null, // géré via monthlyCostChange
  'supplies': null, // géré via monthlyCostChange
  'maintenance': null, // géré via monthlyCostChange
  'marketingValue': null,
  'premium': null,
  'premiumLine': null,
  'physicalPresence': null,
  'scale': null,
  'compromise': null,
  'b2bRelations': null,
  'storytelling': null,
  'producerRelations': null,
  'producerVisibility': null,
  'touristAppeal': null,
  'pressureCost': null,
  'costsHidden': null,
  'taxBenefit': null,
  'socialMix': null,
  'freshness': null,
  'waste': null,
  'reliability': null,
  'marginControl': null,
  'renegotiationOption': null,
  'controlLoss': null,
  'controlFull': null,
  'scalability': null,
  'scalabilityHigh': null,
  'ethicalControl': null,
  'ethicalGuarantees': null,
  'royalties': null,
  'transparencyBonus': null,
  'insurance': null,
  'customerTrust': null,
  'securityUpgrade': null,
  'innovativeEmployer': null,
  'customerDivision': null,
  'niche': null,
  'advocacy': null,
  'customerLoyalty': null,
  'customerType': null,
  'avgBasket': null,
  'adoptionRate': null,
  'revenueModel': null,
  'recurrence': null,
  'animalOrigin': null,
  'endOfStory': null,
  'priceCompetitiveness': null,
  'contentType': null,
  'competition': null,
  'growthPotential': null,
  'sponsorshipAppeal': null,
  'volatility': null,
  'streamerCuts': null,
  'diversification': null,
  'viewerGrowth': null,
  'reputationHit': null,
  'localRoots': null,
  'communityDivision': null,
  'secondChance': null,
  'ethicalStance': null,
  'sponsorTrust': null,
  'rebuilding': null,
  'longTermGain': null,
  'longTermSecurity': null,
  'longTermStability': null,
  'longTermValue': null,
  'platformControl': null,
  'revenueShare': null,
  'youtubeLoss': null,
  'stability': null,
  'playerDevelopment': null,
  'playerComfort': null,
  'compliance': null,
  'attractiveness': null,
  'winRate': null,
  'values': null,
  'resilience': null,
  'meaningfulness': null,
  'subsidies': null,
  'stress': null,
  'brandRisk': null,
  'defensiveness': null,
  'trustScore': null,
  'transparency': null,
  'internationalPresence': null,
};

// Thèmes à corriger
const THEMES = [
  'luxeglow',
  'ironfist',
  'canvasco',
  'fcambition',
  'urbanthread',
  'lecomptoir',
  'greenbox',
  'streamlab',
  'petcare'
];

function loadTheme(name) {
  const filePath = path.join(__dirname, 'lib', `game-data-${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveTheme(name, data) {
  const filePath = path.join(__dirname, 'lib', `game-data-${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function convertEffect(key, value) {
  const mapping = EFFECT_MAPPING[key];

  if (mapping === null) {
    return null; // Effet à ignorer
  }

  if (typeof mapping === 'function') {
    return mapping(value);
  }

  if (typeof mapping === 'string') {
    // Conversion simple vers un autre nom
    return { [mapping]: typeof value === 'number' ? value : 10 };
  }

  // Effet inconnu, garder tel quel (sera ignoré par le système)
  return null;
}

function cleanEffects(effects) {
  if (!effects) return {};

  const newEffects = {};

  for (const [key, value] of Object.entries(effects)) {
    // Effets déjà valides
    const validEffects = [
      'customerSatisfaction', 'employeeSatisfaction', 'reputation',
      'socialScore', 'environmentalScore', 'imageImpact',
      'turnoverRisk', 'strikeRisk', 'badBuzzRisk',
      'customerLoss', 'turnover', 'productivity',
      'vandalism', 'maintenanceCost', 'materialCost',
      'employees', 'budget'
    ];

    if (validEffects.includes(key)) {
      newEffects[key] = value;
      continue;
    }

    // Convertir l'effet fantôme
    const converted = convertEffect(key, value);
    if (converted) {
      Object.assign(newEffects, converted);
    }
  }

  return newEffects;
}

function processOption(option) {
  // Nettoyer les effets principaux
  if (option.effects) {
    option.effects = cleanEffects(option.effects);
  }

  // Nettoyer ifSuccess
  if (option.ifSuccess && option.ifSuccess.effects) {
    option.ifSuccess.effects = cleanEffects(option.ifSuccess.effects);
  }

  // Nettoyer ifFailure
  if (option.ifFailure && option.ifFailure.effects) {
    option.ifFailure.effects = cleanEffects(option.ifFailure.effects);
  }

  return option;
}

function fixPhase3CurrentSituation(data) {
  const phase3 = data.phases.find(p => p.id === 3);
  if (!phase3 || !phase3.currentSituation) return;

  const cs = phase3.currentSituation;

  // S'assurer que monthlyCosts existe avec les salaires corrects
  if (!cs.monthlyCosts) {
    cs.monthlyCosts = {
      salaries: cs.employees * 3000
    };
  } else if (cs.monthlyCosts.salaries !== cs.employees * 3000) {
    cs.monthlyCosts.salaries = cs.employees * 3000;
  }
}

// Exécution
console.log('='.repeat(60));
console.log('CORRECTION EXHAUSTIVE - 9 THÈMES');
console.log('Agent Opus - ' + new Date().toISOString().split('T')[0]);
console.log('='.repeat(60));

let totalFixed = 0;
const results = {};

THEMES.forEach(theme => {
  console.log(`\n📝 Traitement de ${theme.toUpperCase()}...`);

  try {
    const data = loadTheme(theme);
    let fixCount = 0;

    // Correction Phase 3 currentSituation
    fixPhase3CurrentSituation(data);

    // Parcourir toutes les phases et options
    data.phases.forEach(phase => {
      phase.decisions.forEach(decision => {
        decision.options.forEach(option => {
          const originalEffects = JSON.stringify(option.effects);
          processOption(option);
          const newEffects = JSON.stringify(option.effects);

          if (originalEffects !== newEffects) {
            fixCount++;
          }
        });
      });
    });

    // Sauvegarder
    saveTheme(theme, data);

    totalFixed += fixCount;
    results[theme] = { status: 'OK', fixes: fixCount };
    console.log(`   ✅ ${fixCount} options nettoyées`);

  } catch (error) {
    results[theme] = { status: 'ERROR', error: error.message };
    console.log(`   ❌ Erreur: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('RÉSUMÉ');
console.log('='.repeat(60));
console.log(`\n📊 Total options nettoyées: ${totalFixed}`);
console.log('\n📝 Résultats par thème:');
Object.entries(results).forEach(([theme, result]) => {
  const icon = result.status === 'OK' ? '✅' : '❌';
  console.log(`   ${icon} ${theme}: ${result.status}${result.fixes ? ` (${result.fixes} fixes)` : ''}`);
});

console.log('\n✅ Correction terminée !');
console.log('→ Exécuter "npm run build" pour valider');
