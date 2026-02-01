'use client';

import { Scores } from '@/lib/types';
import InfoTooltip from './InfoTooltip';
import { getScoreTooltip } from '@/lib/tooltips';

interface ScoreBoardProps {
  scores: Scores;
  showHelp?: boolean;
}

export default function ScoreBoard({ scores, showHelp = false }: ScoreBoardProps) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Scores</h2>
      
      <div className="space-y-5">
        <ScoreBar 
          label="Économique" 
          score={scores.economic}
          scoreType="economic"
          showHelp={showHelp}
        />
        <ScoreBar 
          label="Social" 
          score={scores.social}
          scoreType="social"
          showHelp={showHelp}
        />
        <ScoreBar 
          label="Environnemental" 
          score={scores.environmental}
          scoreType="environmental"
          showHelp={showHelp}
        />
        
        <div className="pt-4 border-t border-gray-200">
          <ScoreBar 
            label="Score global" 
            score={scores.global}
            scoreType="global"
            isGlobal
            showHelp={showHelp}
          />
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  scoreType: string;
  isGlobal?: boolean;
  showHelp?: boolean;
}

function ScoreBar({ label, score, scoreType, isGlobal, showHelp }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={`font-medium text-gray-700 ${isGlobal ? 'text-base' : 'text-sm'} flex items-center`}>
          {label}
          {showHelp && <InfoTooltip {...getScoreTooltip(scoreType, score)} />}
        </span>
        <span className={`font-semibold text-gray-900 ${isGlobal ? 'text-base' : 'text-sm'}`}>
          {score}/100
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
