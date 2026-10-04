'use client';

import { useEffect, useState } from 'react';
import { mediaOverride } from '@/lib/story/assets';

/** prefers-reduced-motion, avec `?motion=reduce` pour la recette manuelle. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forced = new URLSearchParams(window.location.search).get('motion') === 'reduce';
    const update = () => setReduced(forced || query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useMediaOverride() {
  const [override, setOverride] = useState<'off' | 'broken' | null>(null);
  useEffect(() => setOverride(mediaOverride(window.location.search)), []);
  return override;
}
