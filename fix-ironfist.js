const fs = require('fs');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync('lib/game-data-ironfist.json', 'utf8'));

// Backup
fs.writeFileSync('lib/game-data-ironfist.json.backup', JSON.stringify(data, null, 2));

// PHASE 1 - Décision 1 : Équipement
const equip = data.phases[0].decisions[0];

// Option A (Premium)
delete equip.options[0].effects.equipmentQuality;
delete equip.options[0].effects.brandImage;
delete equip.options[0].effects.maintenanceCost;
equip.options[0].effects = {
  customerSatisfaction: 40,
  imageImpact: 30,
  environmentalScore: 10
};
equip.options[0].monthlyCostChange = { maintenance: 800 };

// Option B (Milieu gamme)
delete equip.options[1].effects.equipmentQuality;
delete equip.options[1].effects.brandImage;
delete equip.options[1].effects.maintenanceCost;
equip.options[1].effects = {
  customerSatisfaction: 20,
  imageImpact: 15
};
equip.options[1].monthlyCostChange = { maintenance: 500 };

// Option C (Occasion)
delete equip.options[2].effects.equipmentQuality;
delete equip.options[2].effects.breakdownRisk;
delete equip.options[2].effects.maintenanceCost;
equip.options[2].effects = {
  customerSatisfaction: -10,
  badBuzzRisk: 0.4,
  imageImpact: -15
};
equip.options[2].monthlyCostChange = { maintenance: 1200 };

// Option D (Leasing)
delete equip.options[3].effects.equipmentQuality;
delete equip.options[3].effects.leasingCost;
equip.options[3].effects = {
  customerSatisfaction: 30,
  imageImpact: 20
};
equip.options[3].monthlyCostChange = { equipment: 1500 };

// PHASE 1 - Décision 2 : Coaching
const coaching = data.phases[0].decisions[1];

// Option A (2 coachs)
delete coaching.options[0].effects.coachingQuality;
delete coaching.options[0].effects.growthRate;
coaching.options[0].revenue = 1000; // Croissance +25%/mois
coaching.options[0].effects = {
  customerSatisfaction: 35,
  imageImpact: 20,
  socialScore: 20
};

// Option B (1 coach + stagiaires)
delete coaching.options[1].effects.coachingQuality;
delete coaching.options[1].effects.growthRate;
coaching.options[1].revenue = 600; // Croissance +15%/mois
coaching.options[1].effects = {
  customerSatisfaction: 15,
  socialScore: 10,
  turnoverRisk: 0.3
};
coaching.options[1].monthlyIncrease = 500; // Stagiaires

// Option C (Karim seul)
delete coaching.options[2].effects.coachingQuality;
delete coaching.options[2].effects.burnoutRisk;
delete coaching.options[2].effects.churnRate;
coaching.options[2].effects = {
  customerSatisfaction: -15,
  turnoverRisk: 0.6,
  customerLoss: 0.2
};

// Option D (Partenariat)
delete coaching.options[3].effects.coachingQuality;
delete coaching.options[3].effects.flexibility;
delete coaching.options[3].effects.coachingCost;
coaching.options[3].effects = {
  customerSatisfaction: 10,
  socialScore: 10
};
coaching.options[3].monthlyCostChange = { salaries: 800 };

// PHASE 1 - Décision 3 : Marketing
const mkt = data.phases[0].decisions[2];

// Option A (Réseaux sociaux)
delete mkt.options[0].effects.newMembers;
delete mkt.options[0].effects.growthRate;
delete mkt.options[0].effects.duration;
delete mkt.options[0].effects.brandAwareness;
mkt.options[0].revenue = 3200; // +40 membres × 80€
mkt.options[0].effects = {
  customerSatisfaction: 20,
  imageImpact: 25
};

// Option B (Club amateur)
delete mkt.options[1].effects.newMembers;
delete mkt.options[1].effects.growthRate;
delete mkt.options[1].effects.duration;
delete mkt.options[1].effects.loyalty;
mkt.options[1].revenue = 2000; // +25 membres × 80€
mkt.options[1].effects = {
  customerSatisfaction: 15,
  socialScore: 15,
  imageImpact: 10
};

// Option C (Gratuit)
delete mkt.options[2].effects.newMembers;
delete mkt.options[2].effects.conversionRate;
delete mkt.options[2].effects.churnRisk;
mkt.options[2].revenue = 1440; // +18 membres × 80€
mkt.options[2].effects = {
  customerSatisfaction: 10,
  turnoverRisk: 0.5
};

// Option D (Influenceur)
delete mkt.options[3].effects.newMembers;
delete mkt.options[3].effects.growthRate;
delete mkt.options[3].effects.duration;
delete mkt.options[3].effects.brandImage;
mkt.options[3].revenue = 6400; // +80 membres × 80€
mkt.options[3].effects = {
  customerSatisfaction: 30,
  imageImpact: 30
};

// PHASE 2 - Décision 1 : Concurrence
const comp = data.phases[1].decisions[0];

// Option A (Guerre des prix)
delete comp.options[0].effects.priceReduction;
delete comp.options[0].effects.churnRate;
delete comp.options[0].effects.newMembers;
delete comp.options[0].effects.margin;
comp.options[0].revenue = -1500; // Baisse prix
comp.options[0].effects = {
  customerSatisfaction: 10,
  customerLoss: -0.3, // Récupère des clients
  imageImpact: -20
};

// Option B (Premium)
delete comp.options[1].effects.priceIncrease;
delete comp.options[1].effects.churnRate;
delete comp.options[1].effects.brandValue;
comp.options[1].revenue = 1000; // +10€ × 100 membres
comp.options[1].effects = {
  customerSatisfaction: 25,
  customerLoss: 0.1, // Perte 10%
  imageImpact: 30
};

// Option C (Fidélité)
delete comp.options[2].effects.churnRate;
delete comp.options[2].effects.newMembers;
delete comp.options[2].effects.loyalty;
comp.options[2].revenue = 2400; // +30 membres × 80€
comp.options[2].effects = {
  customerSatisfaction: 20,
  imageImpact: 15
};

// Option D (Ignorer)
delete comp.options[3].effects.churnRate;
delete comp.options[3].effects.marketShare;
comp.options[3].effects = {
  customerLoss: 0.25,
  imageImpact: -15
};

// PHASE 2 - Décision 2 : Expansion
const exp = data.phases[1].decisions[1];

// Option A (MMA)
delete exp.options[0].effects.serviceRange;
delete exp.options[0].effects.newMembers;
delete exp.options[0].effects.insuranceCost;
exp.options[0].effects = {
  customerSatisfaction: 30,
  imageImpact: 20,
  environmentalScore: 5
};
exp.options[0].monthlyCostChange = { insurance: 1200 };

// Option B (Nutrition)
delete exp.options[1].effects.serviceRange;
delete exp.options[1].effects.churnRate;
exp.options[1].effects = {
  customerSatisfaction: 35,
  socialScore: 15,
  imageImpact: 20
};

// Option C (Musculation)
delete exp.options[2].effects.serviceRange;
delete exp.options[2].effects.newMembers;
delete exp.options[2].effects.maintenance;
exp.options[2].revenue = 4800; // +60 membres × 80€
exp.options[2].effects = {
  customerSatisfaction: 20,
  imageImpact: 15
};
exp.options[2].monthlyCostChange = { maintenance: 800 };

// Option D (Focus boxe)
delete exp.options[3].effects.focus;
delete exp.options[3].effects.expertiseImage;
delete exp.options[3].effects.growthRate;
exp.options[3].revenue = 400; // Croissance +10%/mois
exp.options[3].effects = {
  imageImpact: 20,
  environmentalScore: 10
};

// PHASE 2 - Décision 3 : Team
const team = data.phases[1].decisions[2];

// Option A (Recruter)
delete team.options[0].effects.coachingQuality;
delete team.options[0].effects.turnover;
team.options[0].effects.employeeSatisfaction = 40;
team.options[0].effects.imageImpact = 10;
// socialScore OK

// Option B (Augmentation)
delete team.options[1].effects.turnover;
team.options[1].effects.employeeSatisfaction = 30;
// socialScore OK

// Option C (Statut quo)
delete team.options[2].effects.burnoutRisk;
team.options[2].effects.employeeSatisfaction = -25;
// turnoverRisk, socialScore OK

// Option D (Automatisation)
delete team.options[3].effects.efficiency;
delete team.options[3].effects.techCost;
team.options[3].effects.productivity = 1.2;
team.options[3].effects.employeeSatisfaction = 15;
team.options[3].effects.customerSatisfaction = 10;
team.options[3].monthlyCostChange = { utilities: 200 };

// PHASE 3 - Décision 1 : Buyout
const buyout = data.phases[2].decisions[0];

// Option A
delete buyout.options[0].effects.exit;
delete buyout.options[0].effects.money;
delete buyout.options[0].effects.endGame;
buyout.options[0].effects = {
  socialScore: -20,
  imageImpact: 10
};

// Option B
delete buyout.options[1].effects.independence;
buyout.options[1].effects = {
  employeeSatisfaction: 50,
  socialScore: 40,
  imageImpact: 20
};

// Option C
delete buyout.options[2].ifSuccess.effects.exit;
delete buyout.options[2].ifSuccess.effects.money;
delete buyout.options[2].ifSuccess.effects.endGame;
buyout.options[2].ifSuccess.effects = {
  socialScore: -10,
  imageImpact: 20
};

delete buyout.options[2].ifFailure.effects.competitor;
delete buyout.options[2].ifFailure.effects.marketShare;
buyout.options[2].ifFailure.effects = {
  badBuzzRisk: 0.35,
  customerLoss: 0.35,
  imageImpact: -25
};

// PHASE 3 - Décision 2 : Salaires
const sal = data.phases[2].decisions[1];

// Option A
delete sal.options[0].effects.coachingQuality;
sal.options[0].effects.employeeSatisfaction = -35;
sal.options[0].effects.turnoverRisk = 0.4;
// socialScore OK

// Option B
delete sal.options[1].effects.turnover;
sal.options[1].effects.employeeSatisfaction = -25;
sal.options[1].effects.turnoverRisk = 0.35;
// socialScore OK

// Option C
delete sal.options[2].effects.leadershipRespect;
// employeeSatisfaction, socialScore OK

// Option D
delete sal.options[3].effects.turnover;
sal.options[3].effects.productivity = 1.2;
// employeeSatisfaction, socialScore OK

// PHASE 3 - Décision 3 : Ethics
const ethics = data.phases[2].decisions[2];

// Option A
delete ethics.options[0].effects.ethics;
delete ethics.options[0].effects.scandalRisk;
ethics.options[0].effects = {
  customerSatisfaction: 15,
  badBuzzRisk: 0.6,
  socialScore: -40
};

// Option B
delete ethics.options[1].effects.ethics;
ethics.options[1].effects = {
  employeeSatisfaction: 30,
  socialScore: 40,
  imageImpact: 20
};

// Option C
delete ethics.options[2].effects.ethics;
delete ethics.options[2].effects.certification;
ethics.options[2].effects = {
  customerSatisfaction: 35,
  socialScore: 50,
  environmentalScore: 30,
  imageImpact: 30
};

// Option D
delete ethics.options[3].effects.ethics;
delete ethics.options[3].effects.scandalRisk;
ethics.options[3].effects = {
  badBuzzRisk: 0.4,
  socialScore: -20
};

// Sauvegarder
fs.writeFileSync('lib/game-data-ironfist.json', JSON.stringify(data, null, 2));
console.log('✅ IronFist corrigé !');
