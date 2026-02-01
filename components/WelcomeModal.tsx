import { useState } from 'react';

interface WelcomeModalProps {
  onSelect: (guided: boolean) => void;
}

export default function WelcomeModal({ onSelect }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mode de Jeu
          </h2>
          <p className="text-sm text-gray-600">
            Première fois ? Choisissez votre niveau d'aide
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelect(true)}
            className="w-full card p-6 text-left hover:shadow-lg transition-all border-2 border-emerald-500 hover:border-emerald-600"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">🤝</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mode Accompagné
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Explications détaillées + Clara qui vous guide
                </p>
                <p className="text-xs text-gray-500 italic">
                  Recommandé pour découvrir les concepts
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect(false)}
            className="w-full card p-6 text-left hover:shadow-lg transition-all border-2 border-gray-300 hover:border-gray-400"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">💪</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mode Autonome
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Juste les définitions, pas de conseils
                </p>
                <p className="text-xs text-gray-500 italic">
                  Pour ceux qui maîtrisent déjà
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="stat-card p-4 mt-6 border-l-4 border-amber-500">
          <p className="text-xs text-gray-700">
            💡 <strong>Note :</strong> Non parce que je sais que vous êtes mauvais, alors un peu d'aide ne vous fera pas de mal...
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous pourrez changer en cours de jeu
        </p>
      </div>
    </div>
  );
}
