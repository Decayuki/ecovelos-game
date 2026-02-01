'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import ScoreBoard from '@/components/ScoreBoard';
import DecisionCard from '@/components/DecisionCard';
import PhaseIntro from '@/components/PhaseIntro';
import ThemeSelector from '@/components/ThemeSelector';
import BadEndingScreen from '@/components/BadEndingScreen';
import StudentInstructions from '@/components/StudentInstructions';
import WelcomeModal from '@/components/WelcomeModal';
import LexiconSidebar from '@/components/LexiconSidebar';
import ClaraCoach from '@/components/ClaraCoach';
import TimeTransition from '@/components/TimeTransition';
import { GameState, Phase, Theme } from '@/lib/types';
import { applyDecisionEffects, calculateEconomicScore, calculateSocialScore, calculateEnvironmentalScore, calculateGlobalScore, getGrading } from '@/lib/calculations';
import { getThemePhases, getThemeInitialState } from '@/lib/theme-phases-map';
import { checkBadEnding, calculateScandals, calculateReputation } from '@/lib/bad-ending-logic';
import themesData from '@/lib/themes-test.json';

const getInitialState = (themeId: string): GameState => {
  const themeData = getThemeInitialState(themeId);
  
  return {
    themeId,
    ...themeData,
    currentPhase: 0,
    decisions: {},
    scores: {
      economic: 0,
      social: 50,
      environmental: 50,
      global: 0
    },
    customerSatisfaction: 50,
    employeeSatisfaction: 50,
    reputation: 50,
    scandals: 0,
    turnoverRisk: 0,
    strikeRisk: 0,
    badBuzzRisk: 0,
    socialScoreModifier: 0,
    environmentalScoreModifier: 0,
    imageModifier: 0
  };
};

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [showPhaseIntro, setShowPhaseIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [pendingDecisions, setPendingDecisions] = useState<Record<string, string>>({});
  const [fatalErrors, setFatalErrors] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [claraMessage, setClaraMessage] = useState<number>(0);
  const [showTimeTransition, setShowTimeTransition] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    fromPhase: number;
    toPhase: number;
    budgetChange: number;
    monthlyRevenue: number;
    monthlyCosts: number;
    months: number;
  } | null>(null);
  
  const themes = themesData as Theme[];
  const currentTheme = themes.find(t => t.id === selectedTheme);
  const phases: Phase[] = selectedTheme ? getThemePhases(selectedTheme) : [];
  const currentPhase = gameState ? phases[gameState.currentPhase] : null;
  
  useEffect(() => {
    if (!gameState) return;
    // Recalculer les scores à chaque changement d'état
    const newScores = {
      economic: calculateEconomicScore(gameState),
      social: calculateSocialScore(gameState),
      environmental: calculateEnvironmentalScore(gameState),
      global: calculateGlobalScore(gameState)
    };
    if (JSON.stringify(newScores) !== JSON.stringify(gameState.scores)) {
      setGameState(prev => prev ? { ...prev, scores: newScores } : null);
    }
  }, [gameState?.budget, gameState?.monthlyRevenue, gameState?.monthlyCosts]);
  
  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setGameState(getInitialState(themeId));
  };

  const handleWelcomeChoice = (guided: boolean) => {
    setIsGuidedMode(guided);
    setShowWelcomeModal(false);
  };
  
  const handleStartGame = () => {
    setGameStarted(true);
    setShowPhaseIntro(false);
  };
  
  const handleContinueAfterTransition = () => {
    setShowTimeTransition(false);
    setTransitionData(null);
    setShowPhaseIntro(true);
  };
  
  const handleStartPhase = () => {
    setShowPhaseIntro(false);
    setCurrentDecisionIndex(0);
    setPendingDecisions({});
  };
  
  const handleDecisionSelect = (decisionId: string, optionId: string) => {
    setPendingDecisions(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
  };
  
  const handleValidatePhase = () => {
    if (!gameState || !currentPhase) return;
    
    let newState = { ...gameState };
    
    // Appliquer toutes les décisions de la phase
    currentPhase.decisions.forEach(decision => {
      const selectedOptionId = pendingDecisions[decision.id];
      if (selectedOptionId) {
        const option = decision.options.find(opt => opt.id === selectedOptionId);
        if (option) {
          newState = applyDecisionEffects(newState, decision.id, selectedOptionId, option);
          newState.decisions[`${currentPhase.id}-${decision.id}`] = selectedOptionId;
        }
      }
    });
    
    // Calculer scandales et réputation (uniquement pour cosmetique pour l'instant)
    if (selectedTheme === 'cosmetique') {
      newState.scandals = calculateScandals(newState);
      newState.reputation = calculateReputation(newState);
    }
    
    // Simuler le passage du temps (3 mois entre chaque phase)
    const monthsToSimulate = 3;
    const totalCosts = Object.values(newState.monthlyCosts).filter((v): v is number => v !== undefined).reduce((sum, cost) => sum + cost, 0);
    const monthlyCashFlow = newState.monthlyRevenue - totalCosts;
    const budgetChange = monthlyCashFlow * monthsToSimulate;
    newState.budget += budgetChange;
    
    console.log(`\n=== SIMULATION ${monthsToSimulate} MOIS ===`);
    console.log(`CA mensuel: ${newState.monthlyRevenue}€`);
    console.log(`Coûts mensuels détail:`, newState.monthlyCosts);
    console.log(`Coûts totaux: ${totalCosts}€`);
    console.log(`Cash-flow/mois: ${monthlyCashFlow}€`);
    console.log(`Impact budget: ${budgetChange}€`);
    console.log(`Nouveau budget: ${newState.budget}€`);
    
    // Préparer les données de transition
    const currentPhaseNum = currentPhase.id;
    const nextPhaseNum = newState.currentPhase < phases.length - 1 ? currentPhase.id + 1 : currentPhase.id;
    
    // Vérifier bad ending
    const badEndingCheck = checkBadEnding(newState);
    if (badEndingCheck.triggered) {
      newState.badEnding = true;
      setFatalErrors(badEndingCheck.errors);
      setGameState(newState);
      return; // Arrêter le jeu, bad ending screen s'affichera
    }
    
    // Passer à la phase suivante ou terminer le jeu
    if (newState.currentPhase < phases.length - 1) {
      // Afficher l'écran de transition
      setTransitionData({
        fromPhase: currentPhaseNum,
        toPhase: nextPhaseNum,
        budgetChange,
        monthlyRevenue: newState.monthlyRevenue,
        monthlyCosts: totalCosts,
        months: monthsToSimulate
      });
      setShowTimeTransition(true);
      
      newState.currentPhase++;
      
      // Appliquer le currentSituation de la nouvelle phase si défini
      const nextPhase = phases[newState.currentPhase];
      
      console.log(`\n━━━ DÉBUT PHASE ${nextPhase.id} ━━━`);
      console.log(`État au début:`, {
        budget: newState.budget,
        employees: newState.employees,
        monthlyRevenue: newState.monthlyRevenue,
        salaries: newState.monthlyCosts.salaries,
        totalCosts: Object.values(newState.monthlyCosts).filter((v): v is number => v !== undefined).reduce((a,b) => a+b, 0)
      });
      
      if (nextPhase.currentSituation) {
        console.log('\n=== APPLYING CURRENT SITUATION (TIME SKIP) ===');
        
        const oldEmployees = newState.employees;
        const oldRevenue = newState.monthlyRevenue;
        const oldBudget = newState.budget;
        
        // Time skip : l'entreprise a grandi, on RESET l'état opérationnel
        if (nextPhase.currentSituation.employees !== undefined) {
          const growth = nextPhase.currentSituation.employees - oldEmployees;
          newState.employees = nextPhase.currentSituation.employees;
          // RESET salaires = employees × 3000€ (pas de continuation des augmentations Phase 1-2)
          newState.monthlyCosts.salaries = nextPhase.currentSituation.employees * 3000;
          console.log(`Croissance: ${oldEmployees} → ${newState.employees} employés (+${growth})`);
          console.log(`Salaires RESET: ${newState.monthlyCosts.salaries}€ (${newState.employees} × 3000€)`);
        }
        
        // CA : RESET à la nouvelle valeur
        if (nextPhase.currentSituation.monthlyRevenue !== undefined) {
          const growthRatio = nextPhase.currentSituation.monthlyRevenue / oldRevenue;
          newState.monthlyRevenue = nextPhase.currentSituation.monthlyRevenue;
          console.log(`CA: ${oldRevenue}€ → ${newState.monthlyRevenue}€ (×${growthRatio.toFixed(2)})`);
        }
        
        // RESET complet des coûts pour Phase 3 (nouvelle échelle d'entreprise)
        if (nextPhase.id === 3 && nextPhase.currentSituation.monthlyVA !== undefined) {
          const targetVA = nextPhase.currentSituation.monthlyVA;
          const targetCosts = newState.monthlyRevenue - targetVA;
          const otherCosts = targetCosts - newState.monthlyCosts.salaries;
          
          // Répartition des coûts hors salaires
          newState.monthlyCosts = {
            salaries: newState.monthlyCosts.salaries, // Déjà calculé
            materials: Math.round(otherCosts * 0.35),
            maintenance: Math.round(otherCosts * 0.20),
            rent: Math.round(otherCosts * 0.15),
            insurance: Math.round(otherCosts * 0.10),
            marketing: Math.round(otherCosts * 0.10),
            vandalism: Math.round(otherCosts * 0.10)
          };
          
          console.log(`RESET coûts Phase 3: CA ${newState.monthlyRevenue}€ - VA ${targetVA}€ = coûts ${targetCosts}€`);
          console.log(`  Salaires: ${newState.monthlyCosts.salaries}€`);
          console.log(`  Autres: ${otherCosts}€ répartis`);
        }
        
        // Budget : prendre le meilleur (seule chose qui persiste vraiment entre phases)
        if (nextPhase.currentSituation.budget !== undefined) {
          newState.budget = Math.max(newState.budget, nextPhase.currentSituation.budget);
          console.log(`Budget: ${oldBudget}€ → ${newState.budget}€ (max entre actuel et ${nextPhase.currentSituation.budget}€)`);
        }
        
        if (nextPhase.currentSituation.employeeSatisfaction !== undefined) {
          newState.employeeSatisfaction = nextPhase.currentSituation.employeeSatisfaction;
        }
        
        console.log('Après time skip:', {
          employees: newState.employees,
          monthlyRevenue: newState.monthlyRevenue,
          budget: newState.budget,
          salaries: newState.monthlyCosts.salaries,
          totalCosts: Object.values(newState.monthlyCosts).filter((v): v is number => v !== undefined).reduce((a,b) => a+b, 0)
        });
      }
      
      // NE PAS appeler setShowPhaseIntro ici, sera fait après TimeTransition
      setCurrentDecisionIndex(0);
      setPendingDecisions({});
      setGameState(newState);
    } else {
      setGameFinished(true);
      setGameState(newState);
    }
  };
  
  const handleRestart = () => {
    if (selectedTheme) {
      setGameState(getInitialState(selectedTheme));
      setGameStarted(false);
      setGameFinished(false);
      setShowPhaseIntro(true);
      setCurrentDecisionIndex(0);
      setPendingDecisions({});
      setFatalErrors([]);
    }
  };
  
  const handleChangeTheme = () => {
    setSelectedTheme(null);
    setGameState(null);
    setGameStarted(false);
    setGameFinished(false);
    setShowPhaseIntro(true);
    setCurrentDecisionIndex(0);
    setPendingDecisions({});
    setFatalErrors([]);
  };
  
  const allDecisionsMade = currentPhase && 
    currentPhase.decisions.every(decision => pendingDecisions[decision.id]);
  
  // Sélecteur de thèmes
  if (!selectedTheme || !gameState) {
    return (
      <main className="min-h-screen p-6 md:p-12">
        <ThemeSelector themes={themes} onSelectTheme={handleSelectTheme} />
        {showWelcomeModal && <WelcomeModal onSelect={handleWelcomeChoice} />}
      </main>
    );
  }

  // Bad ending screen
  if (gameState.badEnding && currentTheme) {
    return (
      <BadEndingScreen
        badEnding={currentTheme.badEnding}
        themeName={currentTheme.name}
        themeIcon={currentTheme.icon}
        fatalErrors={fatalErrors}
        onRestart={handleRestart}
        onChangeTheme={handleChangeTheme}
      />
    );
  }
  
  if (!gameStarted) {
    return (
      <main className="min-h-screen p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="card p-10 md:p-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {currentTheme?.name}
              </h1>
              <span className="badge">
                v2.1
              </span>
            </div>
            <p className="text-base text-gray-500 mb-8">{currentTheme?.subtitle}</p>
            
            <div className="stat-card text-left p-6 mb-8 max-w-xl mx-auto">
              <h2 className="text-base font-semibold mb-4 text-gray-900">Objectifs d'apprentissage</h2>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Comprendre la notion de <strong>valeur ajoutée</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Appréhender la <strong>répartition de la VA</strong> entre parties prenantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Différencier <strong>valeur actionnariale</strong> et <strong>valeur partenariale</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Prendre des décisions stratégiques en tenant compte des impacts économiques, sociaux et environnementaux</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-10 max-w-xl mx-auto">
              <p className="text-sm text-gray-700">
                {currentTheme?.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleStartGame}
                className="btn-primary"
              >
                COMMENCER LE JEU
              </button>
              <button
                onClick={handleChangeTheme}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                CHANGER DE THÈME
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  if (gameFinished) {
    const grading = getGrading(gameState.scores.global);
    
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 md:p-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Partie terminée</h1>
              <span className="badge">v1.2</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Dashboard state={gameState} showHelp={true} />
              <ScoreBoard scores={gameState.scores} showHelp={true} />
            </div>
            
            <div className="stat-card text-center p-8 mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{grading.label}</h2>
              <p className="text-sm text-gray-600 mb-4">{grading.description}</p>
              <div className="inline-flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">{gameState.scores.global}</span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
            </div>
            
            <div className="card p-6 mb-6">
              <h3 className="text-base font-semibold mb-4 text-gray-900">Analyse de vos décisions</h3>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div key={phase.id} className="border-l-3 border-emerald-500 pl-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">{phase.title}</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                      {phase.decisions.map(decision => {
                        const selectedOption = gameState.decisions[`${phase.id}-${decision.id}`];
                        const option = decision.options.find(opt => opt.id === selectedOption);
                        return (
                          <li key={decision.id} className="flex gap-2">
                            <span className="text-emerald-600">•</span>
                            <span>
                              <strong>{decision.title.replace(/^Décision \d+ : /, '')}</strong> : {option?.label.split('(')[0].trim() || 'Non choisi'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="stat-card p-6 mb-8">
              <h3 className="text-base font-semibold mb-4 text-gray-900">Points de discussion</h3>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Comment vos décisions ont-elles impacté la <strong>valeur ajoutée</strong> ?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Quelle part de la VA est allée aux <strong>salariés</strong> ? Aux <strong>actionnaires</strong> ?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Avez-vous privilégié la <strong>valeur actionnariale</strong> ou la <strong>valeur partenariale</strong> ?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Peut-on être rentable ET éthique ?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Quels sont les risques de privilégier uniquement le profit ?</span>
                </li>
              </ul>
            </div>
            
            {!showInstructions && (
              <div className="stat-card p-6 mb-6 text-center bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-gray-700 mb-3">
                  🎓 <strong>Et maintenant ?</strong> Vous devez rédiger un cours sur ce chapitre !
                </p>
                <button
                  onClick={() => setShowInstructions(true)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  VOIR LES CONSIGNES 📚
                </button>
              </div>
            )}

            {showInstructions && (
              <div className="mb-6">
                <StudentInstructions onClose={() => setShowInstructions(false)} />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="btn-primary"
              >
                REJOUER
              </button>
              <button
                onClick={handleChangeTheme}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                CHANGER DE THÈME
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">{currentTheme?.name}</h1>
            <span className="badge">
              v2.1
            </span>
          </div>
          <div className="text-xs stat-card px-4 py-2 font-medium">
            Phase {currentPhase?.id || 1}/{phases.length}
          </div>
        </div>
        
        {showPhaseIntro && currentPhase ? (
          <PhaseIntro phase={currentPhase} onStart={handleStartPhase} />
        ) : currentPhase && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <Dashboard state={gameState} showHelp={true} />
              <ScoreBoard scores={gameState.scores} showHelp={true} />
            </div>
            
            <div className="space-y-4 mb-6">
              {currentPhase.decisions.map(decision => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  selectedOption={pendingDecisions[decision.id]}
                  onSelect={(optionId) => handleDecisionSelect(decision.id, optionId)}
                />
              ))}
            </div>
            
            {allDecisionsMade && (
              <div className="text-center">
                <button
                  onClick={handleValidatePhase}
                  className="btn-primary"
                >
                  {currentPhase.id < phases.length ? 'VALIDER ET CONTINUER' : 'TERMINER LE JEU'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <LexiconSidebar />
      {isGuidedMode && gameState && currentPhase && (
        <ClaraCoach 
          gameState={gameState} 
          phase={currentPhase.id}
          isGuidedMode={isGuidedMode}
          onDismiss={() => setClaraMessage(prev => prev + 1)}
        />
      )}
      {showTimeTransition && transitionData && (
        <TimeTransition
          fromPhase={transitionData.fromPhase}
          toPhase={transitionData.toPhase}
          budgetChange={transitionData.budgetChange}
          monthlyRevenue={transitionData.monthlyRevenue}
          monthlyCosts={transitionData.monthlyCosts}
          months={transitionData.months}
          onContinue={handleContinueAfterTransition}
        />
      )}
    </main>
  );
}
