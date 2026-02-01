'use client';

import { Phase } from '@/lib/types';

interface PhaseIntroProps {
  phase: Phase;
  onStart: () => void;
}

export default function PhaseIntro({ phase, onStart }: PhaseIntroProps) {
  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold mb-3 text-gray-900">{phase.title}</h2>
      <p className="text-base text-gray-700 mb-6 leading-relaxed">{phase.context}</p>
      
      {phase.currentSituation && (
        <div className="stat-card mb-6">
          <h3 className="font-medium mb-3 text-sm text-gray-700">Situation actuelle</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(phase.currentSituation).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{translateSituation(key)}</span>
                <span className="text-sm font-semibold text-gray-900">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={onStart}
        className="btn-primary"
      >
        COMMENCER CETTE PHASE
      </button>
    </div>
  );
}

function translateSituation(key: string): string {
  const translations: Record<string, string> = {
    monthlyRevenue: 'CA mensuel',
    employees: 'Salariés',
    budget: 'Trésorerie',
    monthlyVA: 'VA mensuelle',
    employeeSatisfaction: 'Satisfaction salariés'
  };
  return translations[key] || key;
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    if (value > 1000) return `${value.toLocaleString()}€`;
    if (value < 1) return `${Math.round(value * 100)}%`;
    return value.toString();
  }
  return String(value);
}
