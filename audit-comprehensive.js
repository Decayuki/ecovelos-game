/**
 * Audit exhaustif des 9 thèmes selon les 7 critères
 * Agent Opus - 2026-02-02
 */

const fs = require('fs');
const path = require('path');

// Effets reconnus par calculations.ts
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
  // Ajouts pour compatibilité
  'employees', // pour les licenciements
  'budget',
];

// Thèmes à auditer
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

function auditTheme(name) {
  const data = loadTheme(name);
  const issues = [];
  const stats = {
    totalOptions: 0,
    fantomEffects: 0,
    validEffects: 0
  };

  // Critère 1: Salaires = employees × 3000
  const expectedSalaries = data.initial.employees * 3000;
  if (data.initial.monthlyCosts.salaries !== expectedSalaries) {
    issues.push({
      type: 'CRITICAL',
      criterion: 1,
      location: 'initial.monthlyCosts.salaries',
      expected: expectedSalaries,
      actual: data.initial.monthlyCosts.salaries,
      message: `Salaires: ${data.initial.monthlyCosts.salaries}€ ≠ ${data.initial.employees} × 3000€ = ${expectedSalaries}€`
    });
  }

  // Parcourir les phases
  data.phases.forEach((phase, phaseIndex) => {
    // Critère 2: Phase 3 currentSituation
    if (phase.id === 3 && phase.currentSituation) {
      const cs = phase.currentSituation;
      const expectedPhase3Salaries = cs.employees * 3000;
      const targetCosts = cs.monthlyRevenue - cs.monthlyVA;

      // Vérifier que les salaires sont documentés
      if (!cs.monthlyCosts) {
        issues.push({
          type: 'WARNING',
          criterion: 2,
          location: `phase 3 currentSituation`,
          message: `monthlyCosts manquant dans currentSituation`
        });
      } else if (cs.monthlyCosts.salaries !== expectedPhase3Salaries) {
        issues.push({
          type: 'CRITICAL',
          criterion: 2,
          location: `phase 3 currentSituation.monthlyCosts.salaries`,
          expected: expectedPhase3Salaries,
          actual: cs.monthlyCosts.salaries,
          message: `Salaires Phase 3: ${cs.monthlyCosts.salaries}€ ≠ ${cs.employees} × 3000€ = ${expectedPhase3Salaries}€`
        });
      }

      // Vérifier cohérence mathématique
      if (expectedPhase3Salaries > targetCosts) {
        issues.push({
          type: 'CRITICAL',
          criterion: 2,
          location: `phase 3 currentSituation`,
          message: `Phase 3 IMPOSSIBLE: Salaires ${expectedPhase3Salaries}€ > Coûts cibles ${targetCosts}€ (CA ${cs.monthlyRevenue}€ - VA ${cs.monthlyVA}€)`
        });
      }
    }

    // Critère 3: Vérifier les effets fantômes
    phase.decisions.forEach((decision, decisionIndex) => {
      decision.options.forEach((option, optionIndex) => {
        stats.totalOptions++;

        if (option.effects) {
          const effectKeys = Object.keys(option.effects);
          effectKeys.forEach(key => {
            if (!VALID_EFFECTS.includes(key)) {
              stats.fantomEffects++;
              issues.push({
                type: 'FANTOM_EFFECT',
                criterion: 3,
                location: `phase ${phase.id} > decision "${decision.title}" > option ${option.id} (${option.label})`,
                effect: key,
                value: option.effects[key],
                message: `Effet fantôme ignoré: ${key} = ${JSON.stringify(option.effects[key])}`
              });
            } else {
              stats.validEffects++;
            }
          });
        }

        // Vérifier ifSuccess / ifFailure
        if (option.ifSuccess && option.ifSuccess.effects) {
          Object.keys(option.ifSuccess.effects).forEach(key => {
            if (!VALID_EFFECTS.includes(key)) {
              issues.push({
                type: 'FANTOM_EFFECT',
                criterion: 3,
                location: `phase ${phase.id} > decision "${decision.title}" > option ${option.id} ifSuccess`,
                effect: key,
                value: option.ifSuccess.effects[key],
                message: `Effet fantôme dans ifSuccess: ${key}`
              });
            }
          });
        }

        if (option.ifFailure && option.ifFailure.effects) {
          Object.keys(option.ifFailure.effects).forEach(key => {
            if (!VALID_EFFECTS.includes(key)) {
              issues.push({
                type: 'FANTOM_EFFECT',
                criterion: 3,
                location: `phase ${phase.id} > decision "${decision.title}" > option ${option.id} ifFailure`,
                effect: key,
                value: option.ifFailure.effects[key],
                message: `Effet fantôme dans ifFailure: ${key}`
              });
            }
          });
        }
      });
    });
  });

  // Critère 4: Pas de champs ÉcoVélos
  const ecoVelosFields = ['fleet', 'utilizationRate'];
  ecoVelosFields.forEach(field => {
    if (data.initial[field] !== undefined) {
      issues.push({
        type: 'CRITICAL',
        criterion: 4,
        location: `initial.${field}`,
        message: `Champ ÉcoVélos trouvé: ${field} = ${data.initial[field]}`
      });
    }
  });

  if (data.initial.monthlyCosts.vandalism !== undefined) {
    issues.push({
      type: 'WARNING',
      criterion: 4,
      location: 'initial.monthlyCosts.vandalism',
      message: `Champ ÉcoVélos trouvé: vandalism = ${data.initial.monthlyCosts.vandalism}`
    });
  }

  return { name, issues, stats, data };
}

// Exécuter l'audit
console.log('='.repeat(80));
console.log('AUDIT EXHAUSTIF - 9 THÈMES - 7 CRITÈRES');
console.log('Agent Opus - ' + new Date().toISOString().split('T')[0]);
console.log('='.repeat(80));
console.log('');

const allResults = [];
let totalIssues = { CRITICAL: 0, WARNING: 0, FANTOM_EFFECT: 0 };

THEMES.forEach(theme => {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 ${theme.toUpperCase()}`);
  console.log('─'.repeat(60));

  try {
    const result = auditTheme(theme);
    allResults.push(result);

    // Compter les issues par type
    const criticals = result.issues.filter(i => i.type === 'CRITICAL');
    const warnings = result.issues.filter(i => i.type === 'WARNING');
    const fantoms = result.issues.filter(i => i.type === 'FANTOM_EFFECT');

    totalIssues.CRITICAL += criticals.length;
    totalIssues.WARNING += warnings.length;
    totalIssues.FANTOM_EFFECT += fantoms.length;

    console.log(`\n📈 Statistiques:`);
    console.log(`   - Options totales: ${result.stats.totalOptions}`);
    console.log(`   - Effets valides: ${result.stats.validEffects}`);
    console.log(`   - Effets fantômes: ${result.stats.fantomEffects}`);

    console.log(`\n❌ Problèmes détectés:`);
    if (criticals.length > 0) {
      console.log(`   🔴 CRITIQUES: ${criticals.length}`);
      criticals.forEach(i => console.log(`      - ${i.message}`));
    }
    if (warnings.length > 0) {
      console.log(`   🟡 WARNINGS: ${warnings.length}`);
      warnings.forEach(i => console.log(`      - ${i.message}`));
    }
    if (fantoms.length > 0) {
      console.log(`   🟠 EFFETS FANTÔMES: ${fantoms.length}`);
      // Grouper par effet
      const grouped = {};
      fantoms.forEach(f => {
        grouped[f.effect] = (grouped[f.effect] || 0) + 1;
      });
      Object.entries(grouped).forEach(([key, count]) => {
        console.log(`      - ${key}: ${count} occurrences`);
      });
    }

    if (result.issues.length === 0) {
      console.log(`   ✅ Aucun problème détecté`);
    }

  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
});

// Résumé final
console.log('\n');
console.log('='.repeat(80));
console.log('RÉSUMÉ FINAL');
console.log('='.repeat(80));
console.log(`\n🔴 CRITIQUES: ${totalIssues.CRITICAL}`);
console.log(`🟡 WARNINGS: ${totalIssues.WARNING}`);
console.log(`🟠 EFFETS FANTÔMES: ${totalIssues.FANTOM_EFFECT}`);
console.log(`\n📊 TOTAL ISSUES: ${totalIssues.CRITICAL + totalIssues.WARNING + totalIssues.FANTOM_EFFECT}`);

// Liste de tous les effets fantômes uniques
console.log('\n📝 LISTE DES EFFETS FANTÔMES UNIQUES:');
const allFantoms = new Set();
allResults.forEach(r => {
  r.issues.filter(i => i.type === 'FANTOM_EFFECT').forEach(i => allFantoms.add(i.effect));
});
Array.from(allFantoms).sort().forEach(e => console.log(`   - ${e}`));
