import { useState, useEffect } from 'react';
import { GameState } from '@/lib/types';

interface ClaraCoachProps {
  gameState: GameState;
  phase: number;
  isGuidedMode: boolean;
  onDismiss: () => void;
}

export interface ClaraMessage {
  text: string;
  tone: 'normal' | 'warning' | 'angry';
}

export default function ClaraCoach({ gameState, phase, isGuidedMode, onDismiss }: ClaraCoachProps) {
  const [message, setMessage] = useState<ClaraMessage | null>(null);
  const [dismissCount, setDismissCount] = useState(0);

  useEffect(() => {
    if (!isGuidedMode) return;

    // Générer message selon situation
    const newMessage = generateMessage(gameState, phase, dismissCount);
    if (newMessage) {
      setMessage(newMessage);
    }
  }, [gameState.budget, gameState.monthlyVA, gameState.scores.economic, isGuidedMode, phase]);

  const handleDismiss = () => {
    setDismissCount(prev => prev + 1);
    setMessage(null);
    onDismiss();
  };

  if (!message || !isGuidedMode) return null;

  const getAvatarExpression = () => {
    switch (message.tone) {
      case 'angry':
        return '😠';
      case 'warning':
        return '😟';
      default:
        return '😊';
    }
  };

  const getToneColor = () => {
    switch (message.tone) {
      case 'angry':
        return 'bg-red-50 border-red-300';
      case 'warning':
        return 'bg-amber-50 border-amber-300';
      default:
        return 'bg-blue-50 border-blue-300';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-sm animate-slide-up">
      <div className={`card p-4 border-2 ${getToneColor()}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">
            {getAvatarExpression()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Clara</h4>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {message.text}
            </p>
            {dismissCount >= 3 && (
              <p className="text-xs text-red-600 mt-2 italic">
                (Tu m'ignores ? OK, débrouille-toi alors ! 😤)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateMessage(gameState: GameState, phase: number, dismissCount: number): ClaraMessage | null {
  const { budget, monthlyVA, scores } = gameState;

  // Clara devient plus méchante si ignorée
  const isAngry = dismissCount >= 3;
  const isWarning = dismissCount >= 1;

  // Budget critique
  if (budget < -20000) {
    return {
      text: isAngry 
        ? "Sérieusement ? -20k€ de dettes et tu continues comme ça ? Bravo champion ! 😤"
        : "ALERTE ROUGE ! Tu as -20 000€ de dettes. Si tu ne redresses pas la barre MAINTENANT, c'est le game over. Réfléchis à ce qui te coûte le plus cher et agis !",
      tone: 'angry'
    };
  }

  if (budget < 0) {
    return {
      text: isAngry
        ? "Déficit... encore. Tu fais exprès ou quoi ? Peut-être que tu devrais lire les explications au lieu de cliquer au hasard ! 😠"
        : "Attention ! Tu es en déficit. Tes dépenses dépassent tes revenus. Il faut soit augmenter ton CA (vendre plus), soit réduire les coûts. Analyse bien tes charges mensuelles.",
      tone: 'warning'
    };
  }

  if (budget < 20000) {
    return {
      text: isWarning
        ? "Budget serré à nouveau... Tu ne m'écoutes jamais hein ? Bon courage pour la suite. 😒"
        : "Ton budget est un peu juste (moins de 20k€). Tu peux continuer, mais fais attention à ne pas trop dépenser d'un coup. Anticipe tes coûts !",
      tone: 'warning'
    };
  }

  // VA négative
  if (monthlyVA && monthlyVA < 0) {
    return {
      text: isAngry
        ? "Valeur ajoutée NÉGATIVE ! Tu détruis de la richesse au lieu d'en créer. C'est l'inverse du but... mais bon, fais comme tu veux ! 🤦"
        : "Ta VA est négative ! Ça signifie que tes consommations intermédiaires (achats) dépassent ton CA. Tu ne crées pas de richesse, tu en détruis. Il faut revoir ton modèle économique rapidement.",
      tone: 'angry'
    };
  }

  // Score économique bas
  if (scores.economic < 30) {
    return {
      text: isAngry
        ? "Score économique à 30... Impressionnant. Dans le mauvais sens. Tu veux vraiment finir SDF ou c'est juste pour voir ? 😤"
        : "Ton score économique est très bas (< 30). Tu n'es pas rentable du tout. Regarde ce qui coûte le plus cher et ce qui rapporte le moins. Il faut rééquilibrer !",
      tone: 'warning'
    };
  }

  // Messages positifs (moins fréquents)
  if (budget > 50000 && monthlyVA && monthlyVA > 5000 && dismissCount === 0) {
    return {
      text: "Bien joué ! Ton budget est sain et ta VA positive. Continue comme ça et pense à investir dans la durabilité. Tu es sur la bonne voie ! 😊",
      tone: 'normal'
    };
  }

  // Phase 2 : trahisons
  if (phase === 2 && dismissCount === 0) {
    return {
      text: "Phase 2 : Attention aux trahisons ! Certains partenaires ne sont pas ceux qu'ils prétendent être. Lis bien les options avant de choisir, certaines cachent des pièges... 🎭",
      tone: 'normal'
    };
  }

  // Phase 3 : dilemmes
  if (phase === 3 && dismissCount === 0) {
    return {
      text: "Phase 3 : Les vrais dilemmes arrivent. Profit vs Valeurs. Court-terme vs Long-terme. Il n'y a pas toujours de 'bonne' réponse, mais certaines sont catastrophiques. Bonne chance ! 🤔",
      tone: 'normal'
    };
  }

  return null;
}
