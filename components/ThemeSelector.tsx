import { Theme } from '@/lib/types';

interface ThemeSelectorProps {
  themes: Theme[];
  onSelectTheme: (themeId: string) => void;
}

const ThemeIcon = ({ icon }: { icon: string }) => {
  if (!icon) return null;
  
  return (
    <div className="w-12 h-12 flex-shrink-0 text-gray-700 group-hover:text-emerald-600 transition-colors">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {icon === '/icons/ecovelos.svg' && (
          <>
            <circle cx="20" cy="48" r="8"/>
            <circle cx="44" cy="48" r="8"/>
            <path d="M28 48h8"/>
            <path d="M20 40V28l8-8h8l8 8v12"/>
            <path d="M32 20v-4"/>
            <circle cx="32" cy="14" r="2"/>
            <path d="M24 28l-4-8"/>
            <path d="M40 28l4-8"/>
          </>
        )}
        {icon === '/icons/cosmetique.svg' && (
          <>
            <rect x="24" y="20" width="16" height="28" rx="2"/>
            <path d="M24 32h16"/>
            <rect x="28" y="12" width="8" height="8" rx="1"/>
            <circle cx="32" cy="40" r="4"/>
          </>
        )}
        {icon === '/icons/boxe.svg' && (
          <>
            <circle cx="24" cy="28" r="6"/>
            <circle cx="40" cy="28" r="6"/>
            <path d="M18 28h-4"/>
            <path d="M46 28h4"/>
            <path d="M24 34v8"/>
            <path d="M40 34v8"/>
            <path d="M20 42h24"/>
          </>
        )}
        {icon === '/icons/art.svg' && (
          <>
            <rect x="16" y="16" width="32" height="32" rx="2"/>
            <path d="M24 24h16"/>
            <path d="M24 32h8"/>
            <circle cx="36" cy="36" r="4"/>
          </>
        )}
        {icon === '/icons/foot.svg' && (
          <>
            <circle cx="32" cy="32" r="16"/>
            <path d="M32 16v32M16 32h32"/>
            <path d="M20 20l24 24M44 20L20 44"/>
          </>
        )}
        {icon === '/icons/mode.svg' && (
          <>
            <path d="M32 12L20 24v24h24V24L32 12z"/>
            <path d="M28 32h8"/>
            <path d="M28 40h8"/>
          </>
        )}
        {icon === '/icons/resto.svg' && (
          <>
            <path d="M24 12v16M28 12v16M32 12v24"/>
            <path d="M24 28h8"/>
            <path d="M32 36v16M40 12v40"/>
            <path d="M36 16h8"/>
          </>
        )}
        {icon === '/icons/greenbox.svg' && (
          <>
            <rect x="16" y="24" width="32" height="24" rx="2"/>
            <path d="M24 24v-4c0-4 4-8 8-8s8 4 8 8v4"/>
            <path d="M28 32v8M36 32v8"/>
            <path d="M24 36h16"/>
          </>
        )}
        {icon === '/icons/streamlab.svg' && (
          <>
            <rect x="12" y="16" width="40" height="32" rx="2"/>
            <polygon points="28,26 28,38 38,32"/>
            <circle cx="44" cy="22" r="4"/>
          </>
        )}
        {icon === '/icons/petcare.svg' && (
          <>
            <ellipse cx="32" cy="40" rx="12" ry="8"/>
            <circle cx="24" cy="28" r="4"/>
            <circle cx="40" cy="28" r="4"/>
            <circle cx="20" cy="20" r="3"/>
            <circle cx="44" cy="20" r="3"/>
          </>
        )}
      </svg>
    </div>
  );
};

export default function ThemeSelector({ themes, onSelectTheme }: ThemeSelectorProps) {
  const getDifficultyStars = (difficulty: 1 | 2 | 3) => {
    return '★'.repeat(difficulty) + '☆'.repeat(3 - difficulty);
  };

  const getDifficultyColor = (difficulty: 1 | 2 | 3) => {
    switch (difficulty) {
      case 1:
        return 'text-green-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card p-10 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Gestion & Valeur Partenariale
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Choisissez votre entreprise et apprenez à gérer la valeur ajoutée et la valeur partenariale
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className="card p-6 text-left hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <ThemeIcon icon={theme.icon} />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {theme.subtitle}
                  </p>
                </div>
              </div>
              <div className={`text-xs font-semibold ${getDifficultyColor(theme.difficulty)} whitespace-nowrap ml-2`}>
                {getDifficultyStars(theme.difficulty)}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">
              {theme.description}
            </p>
          </button>
        ))}
      </div>

      <div className="stat-card p-6 mt-8 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-green-600 font-semibold">★☆☆</span>
            <span>Facile</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-600 font-semibold">★★☆</span>
            <span>Moyen</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <span className="text-red-600 font-semibold">★★★</span>
            <span>Difficile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
