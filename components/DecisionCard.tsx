'use client';

import { Decision, Option } from '@/lib/types';

interface DecisionCardProps {
  decision: Decision;
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function DecisionCard({ decision, onSelect, selectedOption }: DecisionCardProps) {
  return (
    <div className="card p-6">
      <h3 className="text-base font-semibold mb-1.5 text-gray-900">{decision.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{decision.question}</p>
      
      <div className="space-y-2.5">
        {decision.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
}

function OptionButton({ option, isSelected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{option.label}</p>
          {(option.cost || option.monthlyIncrease || option.revenue) && (
            <div className="mt-2 flex gap-3 flex-wrap">
              {option.cost && option.cost > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  Coût : {option.cost.toLocaleString()}€
                </span>
              )}
              {option.monthlyIncrease && option.monthlyIncrease > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  +{option.monthlyIncrease.toLocaleString()}€/mois
                </span>
              )}
              {option.revenue && (
                <span className="text-xs text-green-600 font-medium">
                  +{option.revenue.toLocaleString()}€
                </span>
              )}
            </div>
          )}
        </div>
        {isSelected && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
