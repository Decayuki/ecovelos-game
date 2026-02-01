import { GameState } from './types';

export const getBudgetTooltip = (budget: number) => {
  let context = '';
  let advice = '';

  if (budget > 50000) {
    context = `${budget.toLocaleString()}€ - Situation très confortable. Tu as de la marge pour investir.`;
    advice = 'Profites-en pour faire des investissements stratégiques (R&D, marketing, qualité). Ne te repose pas sur tes lauriers !';
  } else if (budget >= 20000) {
    context = `${budget.toLocaleString()}€ - Budget correct mais pas énorme. Reste vigilant.`;
    advice = 'Évite les dépenses impulsives. Garde toujours une marge de sécurité pour les imprévus.';
  } else if (budget >= 0) {
    context = `${budget.toLocaleString()}€ - Budget serré ! Une grosse dépense et tu bascules en déficit.`;
    advice = 'Sois très prudent sur les investissements. Priorise ce qui rapporte vite du CA.';
  } else if (budget >= -20000) {
    context = `${budget.toLocaleString()}€ - DÉFICIT. Tu as des dettes. Situation critique mais récupérable.`;
    advice = 'Urgence ! Il faut soit augmenter tes revenus rapidement, soit couper dans les coûts non essentiels.';
  } else {
    context = `${budget.toLocaleString()}€ - DÉFICIT MAJEUR. Tu es en grande difficulté financière.`;
    advice = 'Situation très grave. Un mauvais choix de plus et c\'est le game over. Analyse bien chaque décision.';
  }

  return {
    term: 'Budget',
    definition: 'Votre trésorerie actuelle, l\'argent disponible dans l\'entreprise.',
    explanation: 'Le budget représente l\'argent que vous avez réellement en caisse. Il évolue chaque mois selon vos revenus (CA) et vos dépenses (salaires, achats, loyers, etc.). Un budget positif = vous avez de l\'argent. Un budget négatif = vous avez des dettes à rembourser.',
    context,
    advice
  };
};

export const getVATooltip = (monthlyVA: number) => {
  let context = '';
  let advice = '';

  if (monthlyVA > 10000) {
    context = `+${monthlyVA.toLocaleString()}€/mois - Excellente création de richesse !`;
    advice = 'Continue sur cette lancée. Pense à comment répartir cette VA : réinvestir ? Augmenter salaires ? Dividendes ?';
  } else if (monthlyVA > 0) {
    context = `+${monthlyVA.toLocaleString()}€/mois - Tu crées de la richesse, c\'est bien.`;
    advice = 'Ta VA est positive mais modeste. Cherche comment l\'augmenter : vendre plus cher ? Acheter moins cher ? Optimiser ?';
  } else if (monthlyVA === 0) {
    context = '0€/mois - Tu es exactement à l\'équilibre. Pas de création de valeur.';
    advice = 'Situation neutre mais fragile. Il faut absolument créer de la VA pour être viable à long terme.';
  } else {
    context = `${monthlyVA.toLocaleString()}€/mois - NÉGATIF ! Tu détruis de la richesse au lieu d\'en créer.`;
    advice = 'Problème majeur : tes achats (consommations intermédiaires) dépassent tes ventes (CA). Ton modèle économique ne fonctionne pas. Il faut revoir ta stratégie en profondeur.';
  }

  return {
    term: 'Valeur Ajoutée (VA)',
    definition: 'La richesse créée par votre activité.',
    explanation: 'Formule magique : VA = Chiffre d\'Affaires - Consommations Intermédiaires. Les consommations intermédiaires sont tous les achats que tu fais pour produire (matières, fournitures, etc.). La VA mesure ce que TOI tu crées vraiment comme richesse. Cette richesse sera ensuite répartie entre salariés, État, actionnaires, et réinvestie dans l\'entreprise.',
    context,
    advice
  };
};

export const getCATooltip = (monthlyRevenue: number) => {
  return {
    term: 'Chiffre d\'Affaires Mensuel',
    definition: 'Total de vos ventes sur un mois.',
    explanation: 'Le CA représente tout l\'argent que tu encaisses grâce à tes ventes. ATTENTION : ce n\'est PAS ton profit ! Du CA, il faut encore enlever tous les coûts (achats, salaires, loyers, etc.) pour savoir ce qui te reste vraiment. Ne confonds jamais CA et bénéfice !',
    context: `${monthlyRevenue.toLocaleString()}€/mois - Ventes actuelles`,
    advice: 'Pour augmenter le CA : vendre plus d\'unités, augmenter tes prix, ou trouver de nouveaux clients. Mais attention à ne pas sacrifier la qualité ou tes valeurs pour vendre plus !'
  };
};

export const getEmployeesTooltip = (employees: number) => {
  let context = '';
  let advice = '';

  if (employees <= 3) {
    context = `${employees} employés - Équipe minimaliste. Tu fais avec les moyens du bord.`;
    advice = 'Petite équipe = moins de coûts salariaux mais aussi moins de capacité de production. Si tu veux grandir, il faudra embaucher.';
  } else if (employees <= 10) {
    context = `${employees} employés - Équipe correcte pour une PME.`;
    advice = 'Taille d\'équipe raisonnable. Veille au bien-être de tes salariés : ils sont ta ressource principale. Un salarié motivé = productivité élevée.';
  } else {
    context = `${employees} employés - Grande équipe ! Gros masse salariale.`;
    advice: 'Beaucoup d\'employés = gros coûts salariaux. Assure-toi que ta VA est assez élevée pour les payer correctement. Licencier est tentant mais a un coût social.'
  }

  return {
    term: 'Employés',
    definition: 'Nombre de salariés dans votre entreprise.',
    explanation: 'Vos employés sont votre force de travail. Plus tu as d\'employés, plus tu peux produire... mais plus ta masse salariale (salaires + charges) est élevée. Il faut trouver le bon équilibre : assez d\'employés pour produire efficacement, mais pas trop pour ne pas crever sous les charges.',
    context,
    advice
  };
};

export const getScoreTooltip = (scoreType: string, score: number) => {
  let definition = '';
  let explanation = '';
  let context = '';
  let advice = '';

  switch (scoreType) {
    case 'economic':
      definition = 'Mesure votre rentabilité et viabilité financière.';
      explanation = 'Le score économique évalue si vous êtes rentable. Il prend en compte votre budget, vos revenus, vos coûts, et votre VA. Un score élevé = entreprise financièrement saine. Un score faible = vous perdez de l\'argent ou vous êtes trop juste.';
      
      if (score >= 75) {
        context = `${score}/100 - Excellente santé financière !`;
        advice = 'Continue ! Mais ne deviens pas cupide : la rentabilité ne doit pas se faire au détriment de tout le reste.';
      } else if (score >= 50) {
        context = `${score}/100 - Situation économique correcte.`;
        advice = 'Tu es viable mais tu peux mieux faire. Cherche à optimiser tes coûts et augmenter tes marges.';
      } else if (score >= 30) {
        context = `${score}/100 - Situation économique fragile.`;
        advice = 'Tu n\'es pas loin du rouge. Il faut améliorer ta rentabilité rapidement : augmente CA ou réduis coûts.';
      } else {
        context = `${score}/100 - Situation économique catastrophique.`;
        advice = 'Ton modèle économique ne fonctionne pas. Révise ta stratégie en profondeur ou c\'est la faillite.';
      }
      break;

    case 'social':
      definition = 'Mesure votre impact sur les employés et la société.';
      explanation = 'Le score social évalue comment vous traitez vos salariés et l\'impact social de vos choix. Bien payer, bonnes conditions de travail, formation = score élevé. Licenciements, salaires bas, mauvaises conditions = score faible. Rappel : les salariés sont des parties prenantes importantes !';
      
      if (score >= 75) {
        context = `${score}/100 - Excellent impact social !`;
        advice = 'Tes salariés sont heureux. C\'est un atout pour la productivité et l\'image de marque.';
      } else if (score >= 50) {
        context = `${score}/100 - Impact social correct.`;
        advice = 'Tu fais ce qu\'il faut mais tu peux mieux faire : augmente salaires, améliore conditions ?';
      } else {
        context = `${score}/100 - Impact social médiocre.`;
        advice = 'Tes salariés ne sont pas contents. Attention : un mauvais climat social impacte la productivité et l\'image.';
      }
      break;

    case 'environmental':
      definition = 'Mesure votre impact écologique.';
      explanation = 'Le score environnemental évalue vos choix écologiques. Bio, circuits courts, énergies renouvelables, recyclage = score élevé. Pollution, gaspillage, matériaux non-durables = score faible. L\'environnement est une partie prenante qui compte de plus en plus !';
      
      if (score >= 75) {
        context = `${score}/100 - Excellent impact environnemental !`;
        advice = 'Tu es exemplaire écologiquement. C\'est un vrai argument marketing aujourd\'hui !';
      } else if (score >= 50) {
        context = `${score}/100 - Impact environnemental moyen.`;
        advice = 'Tu fais des efforts mais il y a de la marge. Pense circuits courts, matériaux durables, réduction déchets.';
      } else {
        context = `${score}/100 - Impact environnemental faible.`;
        advice = 'Tu négliges l\'aspect écologique. Attention : les consommateurs sont de plus en plus sensibles à ça. Un scandale écolo peut te couler.';
      }
      break;

    case 'global':
      definition = 'Note finale combinant tous les aspects.';
      explanation = 'Le score global est la synthèse de tes scores économique, social et environnemental. Il reflète ta capacité à équilibrer rentabilité, responsabilité sociale et impact écologique. C\'est la mesure de ta réussite en valeur partenariale (vs valeur actionnariale qui ne regarderait que le profit).';
      
      if (score >= 85) {
        context = `${score}/100 - EXCELLENCE ! Tu maîtrises parfaitement.`;
        advice = 'Bravo ! Tu as réussi à équilibrer profit, social et environnement. C\'est l\'idéal de la valeur partenariale.';
      } else if (score >= 75) {
        context = `${score}/100 - SUCCÈS ! Très bon équilibre.`;
        advice = 'Tu es sur la bonne voie. Quelques ajustements et tu atteindras l\'excellence.';
      } else if (score >= 60) {
        context = `${score}/100 - ÉQUILIBRE correct.`;
        advice = 'Tu t\'en sors mais il y a des faiblesses. Identifie quel score tire vers le bas et améliore-le.';
      } else if (score >= 40) {
        context = `${score}/100 - SURVIE. Tu tiens à peine.`;
        advice = 'Tu survis mais c\'est fragile. Il faut améliorer au moins un des 3 scores (éco/social/enviro).';
      } else {
        context = `${score}/100 - ÉCHEC. C\'est très mauvais.`;
        advice = 'Ton entreprise ne fonctionne pas sur au moins un aspect majeur. Révise ta stratégie globale.';
      }
      break;
  }

  return {
    term: scoreType === 'economic' ? 'Score Économique' : scoreType === 'social' ? 'Score Social' : scoreType === 'environmental' ? 'Score Environnemental' : 'Score Global',
    definition,
    explanation,
    context,
    advice
  };
};
