const fs = require('fs');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync('lib/game-data-luxeglow.json', 'utf8'));

// PHASE 1 - Décision 1 : Certification
const cert = data.phases[0].decisions[0];

// Option A (Ecocert)
cert.options[0].effects = {
  environmentalScore: 40,
  imageImpact: 30,
  customerSatisfaction: 30
};

// Option B (Cosmebio)
cert.options[1].effects = {
  environmentalScore: 25,
  imageImpact: 20,
  customerSatisfaction: 20
};
cert.options[1].revenue = 1200; // Croissance +10%/mois = ~1200€ supplémentaires

// Option C (Auto-certification)
cert.options[2].effects = {
  badBuzzRisk: 0.6,
  imageImpact: -10,
  customerSatisfaction: -10
};

// Option D (Transparence)
cert.options[3].effects = {
  environmentalScore: 15,
  imageImpact: 10,
  customerSatisfaction: 10
};
// Limiter revenus : pas possible via effects direct, on laisse tel quel

// PHASE 1 - Décision 2 : Marketing
const marketing = data.phases[0].decisions[1];

// Option A (Influenceuse)
marketing.options[0].effects = {
  imageImpact: 30,
  customerSatisfaction: 15
};
// revenue déjà présent : 15000

// Option B (Gratuit) - ajouter successRate
marketing.options[1].successRate = 0.5;
marketing.options[1].ifSuccess = {
  revenue: 2000,
  effects: {
    imageImpact: 10
  }
};
marketing.options[1].ifFailure = {
  effects: {}
};
delete marketing.options[1].effects; // Retirer effects au premier niveau

// Option C (Micro-influenceurs)
marketing.options[2].effects = {
  imageImpact: 20,
  customerSatisfaction: 15
};
// revenue déjà présent : 8000

// Option D (DIY)
marketing.options[3].effects = {
  customerSatisfaction: 5
};
// revenue déjà présent : 2000

// PHASE 1 - Décision 3 : Sourcing
const sourcing = data.phases[0].decisions[2];

// Option A (Français bio)
delete sourcing.options[0].effects.materialCost; // On modifie monthlyCosts directement
sourcing.options[0].effects = {
  environmentalScore: 40,
  customerSatisfaction: 20
};
// Ajouter modification monthlyCosts
sourcing.options[0].monthlyCostChange = { materials: 4500 };

// Option B (Européen) - baseline, pas de changement
sourcing.options[1].effects = {
  environmentalScore: 25,
  customerSatisfaction: 10
};
delete sourcing.options[1].effects.materialCost;

// Option C (Asiatique)
delete sourcing.options[2].effects.materialCost;
sourcing.options[2].effects = {
  badBuzzRisk: 0.4,
  environmentalScore: -20,
  customerSatisfaction: -15
};
sourcing.options[2].monthlyCostChange = { materials: 1800 };

// Option D (Produire)
delete sourcing.options[3].effects.materialCost;
sourcing.options[3].effects = {
  environmentalScore: 30,
  customerSatisfaction: 15
};
sourcing.options[3].monthlyCostChange = { materials: 2500 };
// newHires: 1 déjà présent

// PHASE 2 - Décision 1 : Concurrent
const concurrent = data.phases[1].decisions[0];

// Option A (Justice)
delete concurrent.options[0].effects.legalAction;
delete concurrent.options[0].effects.delay; // delay au niveau option
concurrent.options[0].effects = {
  customerSatisfaction: 5
};
concurrent.options[0].delay = 12; // 12 mois

// Option B (Guerre des prix)
delete concurrent.options[1].effects.priceReduction;
delete concurrent.options[1].effects.growthRate;
concurrent.options[1].revenue = -2250; // -25% sur CA 9000€ = -2250€
concurrent.options[1].effects = {
  imageImpact: -10,
  customerSatisfaction: 10 // Plus de clients, mais prix bas
};

// Option C (Innovation)
delete concurrent.options[2].effects.innovation;
delete concurrent.options[2].effects.growthRate;
delete concurrent.options[2].effects.duration;
delete concurrent.options[2].effects.brandValue;
concurrent.options[2].effects = {
  imageImpact: 25,
  customerSatisfaction: 25,
  environmentalScore: 15
};
// revenue déjà présent : 12000

// Option D (Ignorer)
delete concurrent.options[3].effects.brandAwareness;
delete concurrent.options[3].effects.marketShare;
concurrent.options[3].effects = {
  imageImpact: 20,
  customerSatisfaction: -10 // Perte parts de marché = clients mécontents
};

// PHASE 2 - Décision 2 : Distributeur
const distributeur = data.phases[1].decisions[1];

// Option A (Accepter exclusivité)
delete distributeur.options[0].effects.exclusivity;
delete distributeur.options[0].effects.dependencyRisk;
distributeur.options[0].effects = {
  customerSatisfaction: 10,
  badBuzzRisk: 0.2 // Risque si dépendance totale
};
// revenue déjà présent : 40000

// Option B (Négocier) - successRate déjà présent
delete distributeur.options[1].ifSuccess.effects.exclusivity;
delete distributeur.options[1].ifSuccess.effects.dependencyRisk;
distributeur.options[1].ifSuccess.effects = {
  customerSatisfaction: 10,
  badBuzzRisk: 0.15
};
// ifFailure déjà OK (opportunity lost)

// Option C (Refuser)
delete distributeur.options[2].effects.independence;
delete distributeur.options[2].effects.growthRate;
distributeur.options[2].revenue = 900; // Croissance +10%/mois
distributeur.options[2].effects = {
  imageImpact: 5
};

// Option D (Multi-canal)
delete distributeur.options[3].effects.multiChannel;
delete distributeur.options[3].effects.growthRate;
delete distributeur.options[3].effects.complexity;
distributeur.options[3].effects = {
  imageImpact: 15,
  customerSatisfaction: 10
};
// revenue et newHires déjà présents

// PHASE 2 - Décision 3 : RH
const rh = data.phases[1].decisions[2];

// Option A (Recruter)
rh.options[0].effects.productivity = 1.2; // Coefficient correct
delete rh.options[0].effects.turnover; // turnover s'utilise autrement
rh.options[0].effects.employeeSatisfaction = 30;
// socialScore déjà OK

// Option B (Augmentation)
rh.options[1].effects.employeeSatisfaction = 20;
delete rh.options[1].effects.turnover;
// socialScore déjà OK

// Option C (Statut quo)
rh.options[2].effects.employeeSatisfaction = -20;
rh.options[2].effects.turnoverRisk = 0.4; // Déjà OK
// socialScore déjà OK

// Option D (Externaliser)
delete rh.options[3].effects.outsourcing;
delete rh.options[3].effects.quality;
rh.options[3].effects.employeeSatisfaction = -10;
rh.options[3].effects.environmentalScore = -10; // Perte contrôle qualité

// PHASE 3 - Décision 1 : Exit
const exit = data.phases[2].decisions[0];

// Option A (Accepter)
delete exit.options[0].effects.exit;
delete exit.options[0].effects.money;
delete exit.options[0].effects.endGame;
exit.options[0].effects = {
  socialScore: -20, // Clara part
  imageImpact: 10 // Mais réussite financière
};

// Option B (Refuser)
delete exit.options[1].effects.independence;
exit.options[1].effects = {
  employeeSatisfaction: 40,
  socialScore: 30,
  imageImpact: 15
};

// Option C (Négocier)
delete exit.options[2].ifSuccess.effects.exit;
delete exit.options[2].ifSuccess.effects.money;
delete exit.options[2].ifSuccess.effects.endGame;
exit.options[2].ifSuccess.effects = {
  socialScore: -10,
  imageImpact: 20
};

delete exit.options[2].ifFailure.effects.competitor;
delete exit.options[2].ifFailure.effects.marketShare;
exit.options[2].ifFailure.effects = {
  badBuzzRisk: 0.3,
  customerLoss: 0.3, // -30% CA
  imageImpact: -20
};

// PHASE 3 - Décision 2 : Salaires
const salaires = data.phases[2].decisions[1];

// Option A (Licencier)
salaires.options[0].effects.turnoverRisk = 0.3; // Déjà OK
salaires.options[0].effects.employeeSatisfaction = -30; // Ajout
// socialScore déjà OK

// Option B (Baisser salaires)
delete salaires.options[1].effects.turnover;
salaires.options[1].effects.employeeSatisfaction = -20;
salaires.options[1].effects.turnoverRisk = 0.3;
// socialScore déjà OK

// Option C (Baisser VOTRE salaire)
delete salaires.options[2].effects.leadershipRespect;
salaires.options[2].effects.employeeSatisfaction = 40; // Déjà OK
// socialScore déjà OK

// Option D (Augmentation)
delete salaires.options[3].effects.turnover;
salaires.options[3].effects.productivity = 1.15; // Coefficient correct
// employeeSatisfaction déjà OK

// PHASE 3 - Décision 3 : Sourcing
const sourcing3 = data.phases[2].decisions[2];

// Option A (Chimique)
delete sourcing3.options[0].effects.materialCost;
sourcing3.options[0].effects.badBuzzRisk = 0.7; // Déjà OK
sourcing3.options[0].monthlyCostChange = { materials: 2200 };

// Option B (Attendre)
delete sourcing3.options[1].effects.pause;
delete sourcing3.options[1].effects.delay;
delete sourcing3.options[1].effects.revenue;
sourcing3.options[1].delay = 6; // 6 mois
sourcing3.options[1].revenue = -40000; // Perte CA
sourcing3.options[1].effects = {
  environmentalScore: 30
};

// Option C (Alternatif)
delete sourcing3.options[2].effects.materialCost;
sourcing3.options[2].monthlyCostChange = { materials: 3900 };
// environmentalScore et customerSatisfaction déjà OK

// Option D (Local France)
delete sourcing3.options[3].effects.materialCost;
delete sourcing3.options[3].effects.madeInFrance;
sourcing3.options[3].monthlyCostChange = { materials: 3500 };
sourcing3.options[3].effects.imageImpact = 30; // Made in France
// autres effects déjà OK

// Sauvegarder
fs.writeFileSync('lib/game-data-luxeglow.json', JSON.stringify(data, null, 2));
console.log('✅ LuxeGlow corrigé !');
