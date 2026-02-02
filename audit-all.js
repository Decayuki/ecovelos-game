const fs = require('fs');

const themes = [
  'canvasco',
  'fcambition',
  'urbanthread',
  'lecomptoir',
  'greenbox',
  'streamlab',
  'petcare'
];

console.log('🔍 Audit rapide des 7 thèmes restants\n');

themes.forEach(theme => {
  const file = `lib/game-data-${theme}.json`;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  console.log(`\n📁 ${theme.toUpperCase()}`);
  console.log('─'.repeat(50));
  
  // Critère 1 : Salaires = employees × 3000
  const employees = data.initial.employees;
  const salaries = data.initial.monthlyCosts.salaries;
  const expectedSalaries = employees * 3000;
  const c1 = salaries === expectedSalaries ? '✅' : '❌';
  console.log(`${c1} Critère 1: Salaires ${salaries}€ vs attendu ${expectedSalaries}€ (${employees} employés)`);
  
  // Critère 2 : Phase 3 TIME SKIP
  const phase3 = data.phases.find(p => p.id === 3);
  if (phase3 && phase3.currentSituation) {
    const cs = phase3.currentSituation;
    const employees3 = cs.employees;
    const revenue3 = cs.monthlyRevenue;
    const va3 = cs.monthlyVA;
    const salaries3 = employees3 * 3000;
    const couts = revenue3 - va3;
    const c2 = salaries3 < couts ? '✅' : '❌';
    console.log(`${c2} Critère 2: Salaires ${salaries3}€ < Coûts cibles ${couts}€`);
    console.log(`   (${employees3} employés, CA ${revenue3}€, VA ${va3}€)`);
    
    if (salaries3 >= couts) {
      console.log(`   ⚠️  CORRECTION NÉCESSAIRE: Phase 3 impossible !`);
    }
  } else {
    console.log('❓ Critère 2: Phase 3 currentSituation manquant');
  }
  
  // Critère 4 : Pas de champs ÉcoVélos
  const hasFleet = data.initial.fleet !== undefined;
  const hasUtilization = data.initial.utilizationRate !== undefined;
  const hasVandalism = data.initial.monthlyCosts.vandalism !== undefined;
  const c4 = (!hasFleet && !hasUtilization && !hasVandalism) ? '✅' : '❌';
  console.log(`${c4} Critère 4: Pas de champs ÉcoVélos`);
  if (hasFleet) console.log('   ❌ fleet trouvé !');
  if (hasUtilization) console.log('   ❌ utilizationRate trouvé !');
  if (hasVandalism) console.log('   ❌ vandalism trouvé !');
});

console.log('\n\n🏁 Résumé : Tous les thèmes ont besoin de correction Critère 3 (effets fantômes)');
