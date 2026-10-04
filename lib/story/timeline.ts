// Timeline de la traversée (principe SenseNova sn-motion-html) : une seule piste,
// scène → connecteur → scène …, mesurée en hauteurs d'écran. Pur, sans DOM : testé sous Node.

export type ChapterKind = 'opening' | 'phase' | 'finale';
export type Mood = 'dawn' | 'morning' | 'noon' | 'autumn' | 'dusk';

export interface StoryChapter {
  id: string;
  kind: ChapterKind;
  label: string;
  eyebrow: string;
  title?: string;
  copyPosition?: 'left' | 'right' | 'bottom' | 'center';
  paragraphs?: string[];
  phaseIndex?: number;
  hotspots?: [number, number][];
  mood?: Mood;
}

export interface Spans {
  opening: number;
  intro: number;
  decision: number;
  validate: number;
  finale: number;
  connector: number;
}

export type Step = { kind: 'intro' } | { kind: 'decision'; index: number } | { kind: 'validate' };

export interface TimedStep {
  step: Step;
  start: number;
  end: number;
}

export interface Segment {
  kind: 'scene' | 'connector';
  /** Scène : le chapitre ; connecteur : le chapitre de départ. */
  chapterIndex: number;
  start: number;
  end: number;
  steps: TimedStep[];
}

export interface Timeline {
  segments: Segment[];
  scenes: Segment[];
  total: number;
}

/** Chapitres traversés : sur bad ending à la phase k, les phases suivantes disparaissent. */
export function visibleChapters(chapters: StoryChapter[], collapsedAtPhase: number | null): StoryChapter[] {
  if (collapsedAtPhase === null) return chapters;
  return chapters.filter((c) => c.kind !== 'phase' || (c.phaseIndex ?? 0) <= collapsedAtPhase);
}

export function buildTimeline(chapters: StoryChapter[], decisionCounts: number[], spans: Spans): Timeline {
  const segments: Segment[] = [];
  const scenes: Segment[] = [];
  let offset = 0;
  chapters.forEach((chapter, chapterIndex) => {
    const steps: TimedStep[] = [];
    const push = (step: Step, units: number) => {
      steps.push({ step, start: offset, end: offset + units });
      offset += units;
    };
    const start = offset;
    if (chapter.kind === 'phase') {
      push({ kind: 'intro' }, spans.intro);
      const count = decisionCounts[chapter.phaseIndex ?? 0] ?? 0;
      for (let index = 0; index < count; index++) push({ kind: 'decision', index }, spans.decision);
      push({ kind: 'validate' }, spans.validate);
    } else {
      push({ kind: 'intro' }, chapter.kind === 'opening' ? spans.opening : spans.finale);
    }
    const scene: Segment = { kind: 'scene', chapterIndex, start, end: offset, steps };
    segments.push(scene);
    scenes.push(scene);
    if (chapterIndex < chapters.length - 1) {
      segments.push({ kind: 'connector', chapterIndex, start: offset, end: offset + spans.connector, steps: [] });
      offset += spans.connector;
    }
  });
  return { segments, scenes, total: offset };
}

export interface Location {
  segmentIndex: number;
  segment: Segment;
  /** 0–1 dans le segment. */
  local: number;
  /** Étape active (scènes seulement), -1 dans un connecteur. */
  stepIndex: number;
  /** Chapitre « lu » : dans un connecteur, bascule à mi-chemin. */
  chapterIndex: number;
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

export function locate(timeline: Timeline, position: number): Location {
  const { segments } = timeline;
  let segmentIndex = segments.length - 1;
  for (let i = 0; i < segments.length; i++) {
    if (position < segments[i].end) { segmentIndex = i; break; }
  }
  const segment = segments[segmentIndex];
  const local = clamp((position - segment.start) / Math.max(1e-6, segment.end - segment.start));
  let stepIndex = -1;
  if (segment.kind === 'scene') {
    stepIndex = segment.steps.findIndex((s) => position < s.end);
    if (stepIndex === -1) stepIndex = segment.steps.length - 1;
  }
  const chapterIndex = segment.kind === 'scene' ? segment.chapterIndex : segment.chapterIndex + (local >= 0.5 ? 1 : 0);
  return { segmentIndex, segment, local, stepIndex, chapterIndex };
}

/** Position (en écrans) où atterrir pour une étape : un peu après son début. */
export function stepPosition(timeline: Timeline, chapterIndex: number, stepIndex = 0): number {
  const scene = timeline.scenes[chapterIndex];
  if (!scene) return 0;
  const step = scene.steps[Math.min(stepIndex, scene.steps.length - 1)];
  return step.start + Math.min(0.15, (step.end - step.start) * 0.15);
}

export const LOCK_EPSILON = 0.002;

export interface Progress {
  started: boolean;
  /** Index de la phase en cours (0-based) tant que la partie n'est pas finie. */
  currentPhase: number;
  ended: boolean;
}

/**
 * Jusqu'où le lecteur peut défiler : la fin de la scène jouable courante.
 * On ne traverse un connecteur qu'après avoir validé la phase qui le précède.
 */
export function unlockedUntil(timeline: Timeline, chapters: StoryChapter[], progress: Progress): number {
  if (progress.ended) return timeline.total;
  const target = progress.started
    ? chapters.findIndex((c) => c.kind === 'phase' && c.phaseIndex === progress.currentPhase)
    : 0;
  const scene = timeline.scenes[Math.max(0, target)];
  // Juste avant la fin : la borne elle-même appartient déjà au connecteur suivant.
  return scene ? scene.end - LOCK_EPSILON : timeline.total;
}

// ── Caméra ──────────────────────────────────────────────────────────────────

export interface Shot {
  /** Point visé, en % de l'image (0–100). */
  x: number;
  y: number;
  scale: number;
  /** Où poser ce point à l'écran (fractions 0–1) : le centre, ou la zone laissée libre par l'interface. */
  ax: number;
  ay: number;
}

export interface Anchor { x: number; y: number; scale: number }
/** Cadrage d'une décision selon la position (x en %) de son point d'intérêt dans l'image. */
export type Framing = (spotX: number, spotY: number) => Anchor;
export const CENTERED: Framing = () => ({ x: 0.5, y: 0.5, scale: 1.32 });

export interface LayerFrame {
  chapterIndex: number;
  opacity: number;
  /** Translation en % de la boîte image, après clamp pour ne jamais montrer de bord. */
  tx: number;
  ty: number;
  scale: number;
}

const WIDE: Shot = { x: 50, y: 50, scale: 1.04, ax: 0.5, ay: 0.5 };

/** Plan clé de chaque étape : vue large à l'intro, gros plan sur le point d'intérêt de chaque décision. */
export function stepShot(chapter: StoryChapter, step: Step, framing: Framing = CENTERED): Shot {
  if (step.kind === 'decision') {
    const spot = chapter.hotspots?.[step.index];
    if (spot) {
      const anchor = framing(spot[0], spot[1]);
      return { x: spot[0], y: spot[1], scale: anchor.scale, ax: anchor.x, ay: anchor.y };
    }
  }
  if (step.kind === 'validate') return { x: 50, y: 52, scale: 1.0, ax: 0.5, ay: 0.5 };
  return WIDE;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixShot = (a: Shot, b: Shot, t: number): Shot => ({
  x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), scale: mix(a.scale, b.scale, t), ax: mix(a.ax, b.ax, t), ay: mix(a.ay, b.ay, t),
});

/** Plan de caméra continu dans une scène : on tient chaque plan puis on glisse vers le suivant. */
export function sceneShot(chapter: StoryChapter, scene: Segment, position: number, reduced: boolean, framing: Framing = CENTERED): Shot {
  const found = scene.steps.findIndex((s) => position < s.end);
  const index = found === -1 ? scene.steps.length - 1 : found;
  const current = scene.steps[index];
  const shot = stepShot(chapter, current.step, framing);
  if (reduced) return shot;
  const local = clamp((position - current.start) / Math.max(1e-6, current.end - current.start));
  if (chapter.kind !== 'phase') {
    // Ouverture et bilan : lent travelling arrière.
    return { ...shot, scale: mix(1.12, 1.0, local) };
  }
  const next = scene.steps[index + 1];
  if (!next || local < 0.7) return shot;
  return mixShot(shot, stepShot(chapter, next.step, framing), smooth((local - 0.7) / 0.3));
}

/** Translation (en % de la boîte) qui pose le point visé sur son ancre écran, bornée pour ne jamais découvrir un bord. */
export function frame(shot: Shot, view: { width: number; height: number }, box: { width: number; height: number }) {
  const halfX = (view.width / box.width) * 50 / shot.scale;
  const halfY = (view.height / box.height) * 50 / shot.scale;
  const offsetX = ((shot.ax - 0.5) * view.width * 100) / (shot.scale * box.width);
  const offsetY = ((shot.ay - 0.5) * view.height * 100) / (shot.scale * box.height);
  const tx = clamp(50 - shot.x + offsetX, -(50 - halfX), 50 - halfX);
  const ty = clamp(50 - shot.y + offsetY, -(50 - halfY), 50 - halfY);
  return { tx, ty };
}

export const MOBILE_MAX = 760;

/**
 * Côté du panneau de décision (bureau) : à l'opposé du point d'intérêt. Une image 3:2 sur un écran
 * 16:10 laisse très peu de marge de panoramique : c'est l'interface qui s'écarte, pas la caméra.
 */
export function dockSide(view: { width: number }, spotX: number | undefined): 'left' | 'right' | 'bottom' {
  if (view.width <= MOBILE_MAX) return 'bottom';
  return spotX !== undefined && spotX > 60 ? 'left' : 'right';
}

/**
 * Zone libre laissée par l'interface pendant une décision : à côté du panneau (bureau), au-dessus
 * du panneau bas (mobile, où l'on zoome plus pour avoir la marge de cadrage nécessaire).
 */
export function decisionFraming(view: { width: number; height: number }): Framing {
  return (spotX, spotY) => {
    const side = dockSide(view, spotX);
    // Un point bas dans l'image demande plus de zoom pour remonter au-dessus du panneau.
    if (side === 'bottom') return { x: 0.5, y: 0.3, scale: spotY > 58 ? 2.0 : 1.75 };
    return { x: side === 'left' ? 0.68 : 0.33, y: 0.58, scale: 1.32 };
  };
}

/** Boîte image au ratio 3:2 qui couvre l'écran (les points d'intérêt restent alignés sur l'image). */
export function coverBox(view: { width: number; height: number }, ratio = 1.5) {
  const width = Math.max(view.width, view.height * ratio);
  return { width, height: width / ratio };
}

/** Calques visibles à une position : 1 calque dans une scène, fondu plongeant dans un connecteur. */
export function layerFrames(
  timeline: Timeline,
  chapters: StoryChapter[],
  position: number,
  view: { width: number; height: number },
  reduced: boolean,
): LayerFrame[] {
  const box = coverBox(view);
  const framing = decisionFraming(view);
  const at = locate(timeline, position);
  const build = (chapterIndex: number, shot: Shot, opacity: number): LayerFrame => ({ chapterIndex, opacity, scale: shot.scale, ...frame(shot, view, box) });
  if (at.segment.kind === 'scene') {
    const chapter = chapters[at.segment.chapterIndex];
    return [build(at.segment.chapterIndex, sceneShot(chapter, at.segment, position, reduced, framing), 1)];
  }
  const fromIndex = at.segment.chapterIndex;
  const fromScene = timeline.scenes[fromIndex];
  const toScene = timeline.scenes[fromIndex + 1];
  const fromShot = sceneShot(chapters[fromIndex], fromScene, fromScene.end - 1e-4, reduced, framing);
  const toShot = sceneShot(chapters[fromIndex + 1], toScene, toScene.start, reduced, framing);
  const t = smooth((at.local - 0.3) / 0.45);
  if (reduced) {
    return [build(fromIndex, fromShot, 1 - t), build(fromIndex + 1, toShot, t)];
  }
  // Plongée : la scène quittée s'approche, la suivante arrive de plus près et se pose.
  const dive = { ...fromShot, scale: fromShot.scale * (1 + 0.35 * smooth(at.local)) };
  const land = { ...toShot, scale: toShot.scale * (1 + 0.22 * (1 - smooth(at.local))) };
  return [build(fromIndex, dive, 1 - t), build(fromIndex + 1, land, t)];
}
