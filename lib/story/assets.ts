// Résolution des stills de scène depuis content/assets.json (point unique de remplacement).
// Un still « pending » n'est jamais demandé au réseau : la scène procédurale prend le relais.
// Un still « ready » qui échoue au chargement bascule aussi sur le repli (voir SceneLayer).

export interface StillEntry {
  status: 'ready' | 'pending';
  src: string;
}

export interface AssetManifest {
  stills: Record<string, StillEntry>;
}

export function resolveStill(manifest: AssetManifest, sector: string, chapterId: string): string | null {
  const entry = manifest.stills[`${sector}/${chapterId}`];
  return entry && entry.status === 'ready' ? entry.src : null;
}

/** Interrupteur de QA : `?media=off` force le repli média-manquant, `?media=broken` casse les URLs. */
export function mediaOverride(search: string): 'off' | 'broken' | null {
  const value = new URLSearchParams(search).get('media');
  return value === 'off' || value === 'broken' ? value : null;
}

export function applyOverride(src: string | null, override: 'off' | 'broken' | null): string | null {
  if (!src || override === 'off') return null;
  if (override === 'broken') return `${src}.missing`;
  return src;
}
