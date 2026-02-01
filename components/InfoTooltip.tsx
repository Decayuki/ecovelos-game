import { useState } from 'react';

interface InfoTooltipProps {
  term: string;
  definition: string;
  explanation: string;
  context?: string; // Adaptatif selon valeur
  advice?: string; // Conseil sans donner réponse
}

export default function InfoTooltip({ term, definition, explanation, context, advice }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-block relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-emerald-500 hover:text-white transition-colors ml-1 align-middle"
        aria-label={`Info sur ${term}`}
      >
        <span className="text-xs font-bold">i</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel explicatif */}
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:left-auto md:right-auto md:top-full md:mt-2 md:w-80 bg-white rounded-t-2xl md:rounded-lg shadow-xl z-50 border-2 border-emerald-500">
            {/* Handle mobile */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-2 md:hidden" />
            
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">
                  {term}
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* Définition */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Définition :</p>
                <p className="text-sm text-gray-600">{definition}</p>
              </div>

              {/* Explication détaillée */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Explication :</p>
                <p className="text-sm text-gray-600 leading-relaxed">{explanation}</p>
              </div>

              {/* Contexte adaptatif */}
              {context && (
                <div className="stat-card p-3 mb-3 bg-blue-50 border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">Dans ta situation :</p>
                  <p className="text-xs text-blue-800">{context}</p>
                </div>
              )}

              {/* Conseil (sans donner réponse) */}
              {advice && (
                <div className="stat-card p-3 bg-amber-50 border border-amber-200">
                  <p className="text-xs font-medium text-amber-900 mb-1">💡 À retenir :</p>
                  <p className="text-xs text-amber-800">{advice}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
