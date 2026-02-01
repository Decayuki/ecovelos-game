import { BadEnding } from '@/lib/types';

interface BadEndingScreenProps {
  badEnding: BadEnding;
  themeName: string;
  themeIcon: string;
  fatalErrors: string[];
  onRestart: () => void;
  onChangeTheme: () => void;
}

export default function BadEndingScreen({
  badEnding,
  themeName,
  themeIcon,
  fatalErrors,
  onRestart,
  onChangeTheme
}: BadEndingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="card p-10 text-center border-2 border-red-200">
          {/* Titre dramatique */}
          <div className="text-6xl mb-4 opacity-30">💀</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {badEnding.title}
          </h1>
          
          {/* Description */}
          <div className="stat-card p-6 mb-6 text-left">
            <p className="text-base text-gray-700 leading-relaxed">
              {badEnding.description}
            </p>
          </div>

          {/* Conséquences */}
          <div className="card p-6 mb-6 bg-red-50 border border-red-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conséquences
            </h2>
            <ul className="space-y-2.5 text-left">
              {badEnding.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Roast si disponible */}
          {badEnding.roast && (
            <div className="stat-card p-5 mb-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-700 italic">
                💬 <strong>Le prof :</strong> "{badEnding.roast}"
              </p>
            </div>
          )}

          {/* Erreurs fatales */}
          {fatalErrors.length > 0 && (
            <div className="card p-6 mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Vos erreurs fatales
              </h2>
              <ul className="space-y-2 text-left">
                {fatalErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-500">❌</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRestart}
              className="btn-primary bg-gray-800 hover:bg-gray-900"
            >
              RECOMMENCER ({themeName} {themeIcon})
            </button>
            <button
              onClick={onChangeTheme}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              CHANGER DE THÈME
            </button>
          </div>

          {/* Message encouragement */}
          <div className="mt-8 text-sm text-gray-500 italic">
            💡 Astuce : Analysez vos erreurs et recommencez. C'est comme ça qu'on apprend !
          </div>
        </div>
      </div>
    </div>
  );
}
