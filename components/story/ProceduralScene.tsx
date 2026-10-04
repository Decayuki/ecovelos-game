// Repli « média manquant » : une scène vectorielle dessinée au ratio 3:2 de la boîte image,
// teintée par l'ambiance du chapitre. Les points d'intérêt restent placés au même endroit.
import type { Mood } from '@/lib/story/timeline';

const SKIES: Record<Mood, [string, string, string]> = {
  dawn: ['#3b4a6b', '#e9a87c', '#f6d9b5'],
  morning: ['#5d8fbf', '#a9cbe0', '#e8eef0'],
  noon: ['#3f86c6', '#8ec3e6', '#e3f1f7'],
  autumn: ['#5b6f8a', '#d7a36a', '#f1d7a8'],
  dusk: ['#1f2440', '#8a4b6b', '#f09a5c'],
};

// Silhouette de ville déterministe (pas d'aléa : rendu identique serveur/client).
const BUILDINGS = Array.from({ length: 26 }, (_, i) => ({
  x: i * 60 - 10,
  w: 48 + ((i * 37) % 30),
  h: 90 + ((i * 53) % 120),
}));

export default function ProceduralScene({ mood = 'morning', label }: { mood?: Mood; label: string }) {
  const [top, mid, low] = SKIES[mood];
  const id = `sky-${mood}`;
  const sunY = mood === 'dusk' ? 600 : mood === 'dawn' ? 560 : 260;
  return (
    <svg viewBox="0 0 1500 1000" preserveAspectRatio="xMidYMid slice" className="story-procedural" role="img" aria-label={label}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d8a80" />
          <stop offset="1" stopColor="#4c4a45" />
        </linearGradient>
      </defs>
      <rect width="1500" height="1000" fill={`url(#${id})`} />
      <circle cx="1180" cy={sunY} r="70" fill="#fff4dc" opacity="0.75" />
      {/* Colline et basilique (Fourvière) */}
      <path d="M380 640 C520 470 760 430 980 560 L1050 640 Z" fill="#4f6b5a" opacity="0.75" />
      <g fill="#e7e1d4" opacity="0.85">
        <rect x="660" y="430" width="70" height="60" />
        <rect x="650" y="400" width="18" height="90" />
        <rect x="722" y="400" width="18" height="90" />
        <path d="M800 470 l8 -90 l8 90 z" />
      </g>
      {/* Ville */}
      <g fill="#7d7468" opacity="0.8">
        {BUILDINGS.map((b, i) => <rect key={i} x={b.x} y={660 - b.h} width={b.w} height={b.h + 20} />)}
      </g>
      <rect y="640" width="1500" height="50" fill="#6f93a8" opacity="0.7" />
      <rect y="690" width="1500" height="310" fill={`url(#${id}-ground)`} />
      {/* Rangée de vélos turquoise */}
      <g stroke="#2aa198" strokeWidth="6" fill="none" opacity="0.9">
        {Array.from({ length: 9 }, (_, i) => {
          const x = 620 + i * 95;
          return (
            <g key={i} transform={`translate(${x} 800)`}>
              <circle cx="0" cy="60" r="34" />
              <circle cx="90" cy="60" r="34" />
              <path d="M0 60 L30 10 L70 10 L90 60 M30 10 L45 60 L0 60 M70 10 l-6 -18 h16" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
