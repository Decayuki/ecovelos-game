'use client';

import { forwardRef, useState } from 'react';
import type { StoryChapter } from '@/lib/story/timeline';
import ProceduralScene from './ProceduralScene';
import Picto from './Picto';

export interface HotspotView {
  picto: string;
  label: string;
  done: boolean;
}

interface SceneLayerProps {
  chapter: StoryChapter;
  src: string | null;
  eager: boolean;
  hotspots: HotspotView[];
  activeHotspot: number;
  interactive: boolean;
  onHotspot: (index: number) => void;
}

/** Un calque de la scène fixe : still (ou repli procédural) + points d'intérêt, déplacé par la caméra. */
const SceneLayer = forwardRef<HTMLDivElement, SceneLayerProps>(function SceneLayer(
  { chapter, src, eager, hotspots, activeHotspot, interactive, onHotspot },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const missing = !src || failed;
  return (
    <div ref={ref} className="story-layer" data-chapter={chapter.id} data-media={missing ? 'fallback' : 'still'} style={{ opacity: 0 }}>
      {missing ? (
        <ProceduralScene mood={chapter.mood} label={chapter.label} />
      ) : (
        // Image statique servie depuis public/ : pas d'optimisation Next nécessaire.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="story-still" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
      )}
      {chapter.hotspots?.map(([x, y], index) => {
        const spot = hotspots[index];
        if (!spot) return null;
        return (
          <button
            key={index}
            type="button"
            className="story-hotspot"
            data-active={index === activeHotspot}
            data-done={spot.done}
            style={{ left: `${x}%`, top: `${y}%` }}
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            aria-label={`Aller à la décision : ${spot.label}`}
            onClick={() => onHotspot(index)}
          >
            <span className="story-hotspot__ring" aria-hidden="true" />
            <Picto name={spot.done ? 'check' : spot.picto} className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
});

export default SceneLayer;
