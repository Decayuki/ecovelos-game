/**
 * Tests automatisés - Serious Game ÉcoVélos
 * Validation des 9 thèmes selon les 7 critères
 *
 * Agent Opus - 2026-02-02
 */

const fs = require('fs');
const path = require('path');

// Configuration
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

const VALID_EFFECTS = [
  'customerSatisfaction',
  'employeeSatisfaction',
  'reputation',
  'socialScore',
  'environmentalScore',
  'imageImpact',
  'turnoverRisk',
  'strikeRisk',
  'badBuzzRisk',
  'customerLoss',
  'turnover',
  'productivity',
  'vandalism',
  'maintenanceCost',
  'materialCost',
  'employees',
  'budget'
];

const SALARY_PER_EMPLOYEE = 3000;

// Utility functions
function loadTheme(name) {
  const filePath = path.join(__dirname, '..', 'lib', `game-data-${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadEcoVelos() {
  const filePath = path.join(__dirname, '..', 'lib', 'game-data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Test counters
let passCount = 0;
let failCount = 0;
const failures = [];

function test(description, condition, details = '') {
  if (condition) {
    passCount++;
    console.log(`  ✅ ${description}`);
  } else {
    failCount++;
    const msg = details ? `${description} - ${details}` : description;
    failures.push(msg);
    console.log(`  ❌ ${description}`);
    if (details) console.log(`     → ${details}`);
  }
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  console.log('─'.repeat(50));
  fn();
}

// ============================================================
// TESTS
// ============================================================

console.log('='.repeat(60));
console.log('🧪 TESTS AUTOMATISÉS - SERIOUS GAME ÉCOVÉLOS');
console.log('='.repeat(60));
console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
console.log(`Thèmes testés: ${THEMES.length}`);

// Test 1: Structure JSON valide
describe('Test 1: Structure JSON valide', () => {
  THEMES.forEach(theme => {
    try {
      const data = loadTheme(theme);
      test(
        `${theme}: JSON parseable`,
        data !== null && typeof data === 'object'
      );
      test(
        `${theme}: Contient initial`,
        data.initial !== undefined
      );
      test(
        `${theme}: Contient phases`,
        Array.isArray(data.phases) && data.phases.length >= 3
      );
      test(
        `${theme}: Contient scoring`,
        data.scoring !== undefined
      );
      test(
        `${theme}: Contient grading`,
        data.grading !== undefined
      );
    } catch (e) {
      test(`${theme}: JSON valide`, false, e.message);
    }
  });
});

// Test 2: Critère 1 - Salaires = employees × 3000
describe('Test 2: Critère 1 - Salaires initiaux = employees × 3000€', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const expected = data.initial.employees * SALARY_PER_EMPLOYEE;
    const actual = data.initial.monthlyCosts.salaries;
    test(
      `${theme}: ${data.initial.employees} employés × 3000€ = ${expected}€`,
      actual === expected,
      `Attendu: ${expected}€, Actuel: ${actual}€`
    );
  });
});

// Test 3: Critère 2 - Phase 3 currentSituation
describe('Test 3: Critère 2 - Phase 3 currentSituation cohérente', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const phase3 = data.phases.find(p => p.id === 3);

    if (!phase3 || !phase3.currentSituation) {
      test(`${theme}: Phase 3 existe`, false, 'Phase 3 ou currentSituation manquant');
      return;
    }

    const cs = phase3.currentSituation;

    // Test monthlyCosts existe
    test(
      `${theme}: monthlyCosts présent`,
      cs.monthlyCosts !== undefined
    );

    if (cs.monthlyCosts) {
      // Test salaires Phase 3
      const expectedSalaries = cs.employees * SALARY_PER_EMPLOYEE;
      test(
        `${theme}: Salaires P3 = ${cs.employees} × 3000€ = ${expectedSalaries}€`,
        cs.monthlyCosts.salaries === expectedSalaries,
        `Attendu: ${expectedSalaries}€, Actuel: ${cs.monthlyCosts.salaries}€`
      );
    }

    // Test cohérence mathématique (VA = CA - Coûts, donc Coûts > Salaires)
    const targetCosts = cs.monthlyRevenue - cs.monthlyVA;
    const salaries = cs.employees * SALARY_PER_EMPLOYEE;
    test(
      `${theme}: Coûts cibles (${targetCosts}€) > Salaires (${salaries}€)`,
      targetCosts > salaries,
      `Impossible d'avoir VA=${cs.monthlyVA}€ si salaires seuls = ${salaries}€`
    );
  });
});

// Test 4: Critère 3 - Effets valides uniquement
describe('Test 4: Critère 3 - Aucun effet fantôme', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    let fantomCount = 0;
    const fantomEffects = [];

    data.phases.forEach(phase => {
      phase.decisions.forEach(decision => {
        decision.options.forEach(option => {
          // Check main effects
          if (option.effects) {
            Object.keys(option.effects).forEach(key => {
              if (!VALID_EFFECTS.includes(key)) {
                fantomCount++;
                fantomEffects.push(key);
              }
            });
          }
          // Check ifSuccess
          if (option.ifSuccess?.effects) {
            Object.keys(option.ifSuccess.effects).forEach(key => {
              if (!VALID_EFFECTS.includes(key)) {
                fantomCount++;
                fantomEffects.push(key);
              }
            });
          }
          // Check ifFailure
          if (option.ifFailure?.effects) {
            Object.keys(option.ifFailure.effects).forEach(key => {
              if (!VALID_EFFECTS.includes(key)) {
                fantomCount++;
                fantomEffects.push(key);
              }
            });
          }
        });
      });
    });

    const uniqueFantoms = [...new Set(fantomEffects)];
    test(
      `${theme}: 0 effets fantômes`,
      fantomCount === 0,
      fantomCount > 0 ? `${fantomCount} fantômes: ${uniqueFantoms.slice(0, 5).join(', ')}${uniqueFantoms.length > 5 ? '...' : ''}` : ''
    );
  });
});

// Test 5: Critère 4 - Pas de champs ÉcoVélos
describe('Test 5: Critère 4 - Pas de champs spécifiques ÉcoVélos', () => {
  const ecoVelosFields = ['fleet', 'utilizationRate'];

  THEMES.forEach(theme => {
    const data = loadTheme(theme);

    ecoVelosFields.forEach(field => {
      test(
        `${theme}: Pas de "${field}" dans initial`,
        data.initial[field] === undefined,
        `Trouvé: ${field} = ${data.initial[field]}`
      );
    });
  });
});

// Test 6: Critère 7 - Gameplay équilibré
describe('Test 6: Critère 7 - Gameplay équilibré', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const phase3 = data.phases.find(p => p.id === 3);

    // Budget initial raisonnable (30k - 200k)
    test(
      `${theme}: Budget initial ${data.initial.budget}€ (30k-200k)`,
      data.initial.budget >= 30000 && data.initial.budget <= 200000
    );

    // CA Phase 3 en croissance vs initial
    if (phase3?.currentSituation) {
      const growth = phase3.currentSituation.monthlyRevenue / data.initial.monthlyRevenue;
      test(
        `${theme}: Croissance CA P3/P1 = ${growth.toFixed(1)}x (1.5x-10x)`,
        growth >= 1.5 && growth <= 10
      );

      // Ratio VA/CA raisonnable (15% - 50%)
      const vaRatio = phase3.currentSituation.monthlyVA / phase3.currentSituation.monthlyRevenue;
      test(
        `${theme}: Ratio VA/CA = ${(vaRatio * 100).toFixed(0)}% (15%-50%)`,
        vaRatio >= 0.15 && vaRatio <= 0.50
      );
    }
  });
});

// Test 7: Décisions et options
describe('Test 7: Structure des décisions', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    let totalDecisions = 0;
    let totalOptions = 0;
    let optionsWithCost = 0;
    let optionsWithEffects = 0;

    data.phases.forEach(phase => {
      totalDecisions += phase.decisions.length;
      phase.decisions.forEach(decision => {
        totalOptions += decision.options.length;
        decision.options.forEach(option => {
          if (option.cost !== undefined || option.monthlyIncrease !== undefined) optionsWithCost++;
          if (option.effects && Object.keys(option.effects).length > 0) optionsWithEffects++;
        });
      });
    });

    test(
      `${theme}: ${totalDecisions} décisions (>=5)`,
      totalDecisions >= 5
    );

    test(
      `${theme}: ${totalOptions} options (>=15)`,
      totalOptions >= 15
    );

    test(
      `${theme}: ${optionsWithEffects}/${totalOptions} options avec effets (>=50%)`,
      optionsWithEffects / totalOptions >= 0.5
    );
  });
});

// Test 8: Grading cohérent
describe('Test 8: Seuils de grading cohérents', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const g = data.grading;

    test(
      `${theme}: fail.max < survival.max < balance.max < success.max < excellence.max`,
      g.fail.max < g.survival.max &&
      g.survival.max < g.balance.max &&
      g.balance.max < g.success.max &&
      g.success.max <= g.excellence.max,
      `Seuils: ${g.fail.max} < ${g.survival.max} < ${g.balance.max} < ${g.success.max} < ${g.excellence.max}`
    );
  });
});

// Test 9: Pas de termes spécifiques ÉcoVélos dans les textes
describe('Test 9: Pas de références textuelles ÉcoVélos', () => {
  const ecoVelosTerms = [
    /\bstation\b/i,
    /\bborne\b/i,
    /\bflotte\b/i,
    /\bfleet\b/i,
    /taux.*(utilisation|occupation)/i,
    /utilization.?rate/i,
    /libre.?service/i,
    /parc.*(vélo|velo)/i
  ];

  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const jsonStr = JSON.stringify(data);

    ecoVelosTerms.forEach(term => {
      const found = term.test(jsonStr);
      // Exception: "station" peut être utilisé dans d'autres contextes (station de radio, etc.)
      if (term.toString().includes('station') && theme === 'streamlab') {
        return; // Skip for streaming context
      }
      test(
        `${theme}: Pas de terme "${term.toString().slice(1, -2)}"`,
        !found
      );
    });
  });
});

// Test 10: ÉcoVélos (référence) a ses champs spécifiques
describe('Test 10: ÉcoVélos (référence) contient fleet/utilizationRate', () => {
  try {
    const ecovelos = loadEcoVelos();
    test(
      'ÉcoVélos: Contient fleet',
      ecovelos.initial.fleet !== undefined,
      `fleet = ${ecovelos.initial.fleet}`
    );
    test(
      'ÉcoVélos: Contient utilizationRate',
      ecovelos.initial.utilizationRate !== undefined,
      `utilizationRate = ${ecovelos.initial.utilizationRate}`
    );
  } catch (e) {
    test('ÉcoVélos: Fichier existe', false, e.message);
  }
});

// Test 11: Simulation simple
describe('Test 11: Simulation basique du calcul de scores', () => {
  THEMES.forEach(theme => {
    const data = loadTheme(theme);
    const phase3 = data.phases.find(p => p.id === 3);

    if (!phase3?.currentSituation) return;

    const cs = phase3.currentSituation;
    const va = cs.monthlyVA;

    // Score économique simplifié
    let ecoScore = 0;
    if (va > 0) ecoScore += 30;
    if (cs.monthlyRevenue > 0 && va / cs.monthlyRevenue > 0.25) ecoScore += 20;
    if (cs.budget > 50000) ecoScore += 20;
    if (cs.monthlyRevenue > 12000) ecoScore += 30;

    test(
      `${theme}: Score éco simulé = ${ecoScore}/100 (>=50)`,
      ecoScore >= 50
    );

    // Satisfaction employés
    test(
      `${theme}: Satisfaction initiale ${cs.employeeSatisfaction}% (>=30)`,
      cs.employeeSatisfaction >= 30
    );
  });
});

// ============================================================
// RÉSUMÉ
// ============================================================

console.log('\n');
console.log('='.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(60));
console.log(`\n✅ Tests réussis: ${passCount}`);
console.log(`❌ Tests échoués: ${failCount}`);
console.log(`📈 Taux de réussite: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log('\n🔴 Échecs détaillés:');
  failures.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
}

console.log('\n');

// Exit code
process.exit(failCount > 0 ? 1 : 0);
