'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Phase, Theme } from '@/lib/types';
import storyData from '@/content/story.json';
import assetManifest from '@/content/assets.json';
import { calculateGlobalScore, getGrading } from '@/lib/calculations';
import { createInitialState, validatePhase, withScores, type PhaseTransition } from '@/lib/engine';
import { emitScoreOnce, newRunId, scoreForStudyNote } from '@/lib/game-score';
import { applyOverride, resolveStill, type AssetManifest } from '@/lib/story/assets';
import {
  buildTimeline, coverBox, dockSide, layerFrames, locate, smooth, stepPosition, unlockedUntil, visibleChapters,
  type Spans, type StoryChapter,
} from '@/lib/story/timeline';
import { generateMessage } from '@/components/ClaraCoach';
import LexiconSidebar from '@/components/LexiconSidebar';
import SceneLayer from './SceneLayer';
import Dock from './Dock';
import Ledger from './Ledger';
import Epilogue from './Epilogue';
import Picto from './Picto';
import { useMediaOverride, useReducedMotion } from './hooks';
import { euro, fill, signedEuro, stripEmoji, stripPrefix } from './format';

interface Story {
  meta: { title: string; kicker: string; subtitle: string; sector: string; spans: Spans };
  objectives: string[];
  chapters: StoryChapter[];
  connectors: { caption: string; detail: string }[];
  collapseConnector: { caption: string; detail: string };
  pictos: Record<string, string>;
  copy: Record<string, string>;
  discussion: string[];
}

const story = storyData as unknown as Story;
const manifest = assetManifest as unknown as AssetManifest;

type Status = 'intro' | 'playing' | 'finished' | 'bad';
interface Active { chapterIndex: number; stepIndex: number; inConnector: boolean }

interface StoryExperienceProps {
  theme: Theme;
  phases: Phase[];
  initial: Record<string, unknown>;
  guided: boolean;
  onExit: () => void;
}

export default function StoryExperience({ theme, phases, initial, guided, onExit }: StoryExperienceProps) {
  const [game, setGame] = useState(() => createInitialState(theme.id, initial));
  const [pending, setPending] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('intro');
  const [fatalErrors, setFatalErrors] = useState<string[]>([]);
  const [transitions, setTransitions] = useState<Record<number, PhaseTransition>>({});
  const [runId, setRunId] = useState<string | null>(null);
  const [active, setActive] = useState<Active>({ chapterIndex: 0, stepIndex: 0, inConnector: false });
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [lexiconOpen, setLexiconOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(800);
  const reduced = useReducedMotion();
  const override = useMediaOverride();

  const ended = status === 'finished' || status === 'bad';
  const chapters = useMemo(() => visibleChapters(story.chapters, status === 'bad' ? game.currentPhase : null), [status, game.currentPhase]);
  const timeline = useMemo(() => buildTimeline(chapters, phases.map((p) => p.decisions.length), story.meta.spans), [chapters, phases]);
  const unlocked = unlockedUntil(timeline, chapters, { started: status !== 'intro', currentPhase: game.currentPhase, ended });

  // ── Moteur de défilement : lecture de scrollY → caméra, copies, légendes (hors React) ──
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const epilogueRef = useRef<HTMLElement>(null);
  const view = useRef({ width: 1280, height: 800 });
  const geometry = useRef({ timeline, chapters, reduced, unlocked });
  geometry.current = { timeline, chapters, reduced, unlocked };
  const activeRef = useRef(active);
  const scheduleRef = useRef<() => void>(() => {});
  const glideRef = useRef<number | null>(null);
  const scrollTarget = useRef<{ chapterId: string; step: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    let queued = false;
    const read = () => {
      queued = false;
      const { timeline: tl, chapters: chs, reduced: rm, unlocked: max } = geometry.current;
      const h = view.current.height;
      const position = Math.min(window.scrollY / h, max);
      const frames = layerFrames(tl, chs, position, view.current, rm);
      layerRefs.current.forEach((el, index) => {
        if (!el) return;
        const f = frames.find((frame) => frame.chapterIndex === index);
        const opacity = f ? f.opacity : 0;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
        if (f) el.style.transform = `translate(-50%, -50%) scale(${f.scale.toFixed(4)}) translate(${f.tx.toFixed(3)}%, ${f.ty.toFixed(3)}%)`;
      });
      const at = locate(tl, position);
      // Sous l'épilogue (après la piste), la copie du bilan s'efface.
      const pastTrack = 1 - smooth((window.scrollY / h - tl.total) / 0.35);
      copyRefs.current.forEach((el, index) => {
        if (!el) return;
        let opacity = 0;
        if (at.segment.kind === 'scene') opacity = at.segment.chapterIndex === index ? 1 : 0;
        else if (at.segment.chapterIndex === index) opacity = 1 - smooth(at.local / 0.2);
        else if (at.segment.chapterIndex + 1 === index) opacity = smooth((at.local - 0.8) / 0.2);
        opacity *= pastTrack;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
      });
      captionRefs.current.forEach((el, index) => {
        if (!el) return;
        const opacity = at.segment.kind === 'connector' && at.segment.chapterIndex === index ? Math.sin(Math.PI * at.local) : 0;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
      });
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, position / tl.total)})`;
      const next: Active = { chapterIndex: at.chapterIndex, stepIndex: at.stepIndex, inConnector: at.segment.kind === 'connector' };
      const prev = activeRef.current;
      if (prev.chapterIndex !== next.chapterIndex || prev.stepIndex !== next.stepIndex || prev.inConnector !== next.inConnector) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(read);
    };
    const layout = () => {
      view.current = { width: window.innerWidth, height: window.innerHeight };
      const box = coverBox(view.current);
      stageRef.current?.style.setProperty('--box-w', `${box.width}px`);
      stageRef.current?.style.setProperty('--box-h', `${box.height}px`);
      setViewportHeight(window.innerHeight);
      schedule();
    };
    const onResize = () => {
      // La barre d'adresse mobile change la hauteur sans changer la largeur : on l'ignore.
      if (window.innerWidth === view.current.width && Math.abs(window.innerHeight - view.current.height) < 80) return;
      layout();
    };
    const stopGlide = () => {
      if (glideRef.current !== null) cancelAnimationFrame(glideRef.current);
      glideRef.current = null;
    };
    scheduleRef.current = schedule;
    layout();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', stopGlide, { passive: true });
    window.addEventListener('touchstart', stopGlide, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', stopGlide);
      window.removeEventListener('touchstart', stopGlide);
      stopGlide();
    };
  }, []);

  useEffect(() => scheduleRef.current(), [timeline, unlocked, reduced, mounted]);

  /** Travelling vers une position (en écrans) : glissé cinématique, ou saut sous mouvement réduit. */
  const glideTo = useCallback((position: number) => {
    const target = position * view.current.height;
    if (glideRef.current !== null) cancelAnimationFrame(glideRef.current);
    if (geometry.current.reduced) {
      window.scrollTo(0, target);
      return;
    }
    const from = window.scrollY;
    const distance = Math.abs(target - from) / view.current.height;
    // Un connecteur se traverse en ~2,5 s : le temps de lire la légende du temps qui passe.
    const duration = Math.min(3400, 700 + distance * 1000);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, from + (target - from) * eased);
      glideRef.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    glideRef.current = requestAnimationFrame(tick);
  }, []);

  const goToStep = useCallback((chapterIndex: number, stepIndex: number) => {
    glideTo(stepPosition(geometry.current.timeline, chapterIndex, stepIndex));
  }, [glideTo]);

  // Après une validation, la piste s'allonge au rendu suivant : on traverse alors le connecteur.
  useLayoutEffect(() => {
    const request = scrollTarget.current;
    if (!request) return;
    const index = chapters.findIndex((c) => c.id === request.chapterId);
    if (index === -1) return;
    scrollTarget.current = null;
    goToStep(index, request.step);
  }, [chapters, unlocked, goToStep]);

  // ── Partie ──
  const phaseChapterId = (phaseIndex: number) => story.chapters.find((c) => c.kind === 'phase' && c.phaseIndex === phaseIndex)?.id ?? '';
  const finaleId = story.chapters.find((c) => c.kind === 'finale')?.id ?? '';

  const handleStart = () => {
    setRunId(newRunId());
    setStatus('playing');
    scrollTarget.current = { chapterId: phaseChapterId(0), step: 0 };
  };

  const handleSelect = (decisionId: string, optionId: string) => setPending((prev) => ({ ...prev, [decisionId]: optionId }));

  const handleValidate = () => {
    const outcome = validatePhase(game, phases, pending);
    setPending({});
    setGame(outcome.state);
    if (outcome.kind === 'next') {
      setTransitions((prev) => ({ ...prev, [outcome.state.currentPhase]: outcome.transition }));
      scrollTarget.current = { chapterId: phaseChapterId(outcome.state.currentPhase), step: 0 };
    } else {
      if (outcome.kind === 'badEnding') setFatalErrors(outcome.fatalErrors);
      setStatus(outcome.kind === 'badEnding' ? 'bad' : 'finished');
      scrollTarget.current = { chapterId: finaleId, step: 0 };
    }
  };

  const handleRestart = () => {
    if (glideRef.current !== null) cancelAnimationFrame(glideRef.current);
    window.scrollTo(0, 0);
    setGame(createInitialState(theme.id, initial));
    setPending({});
    setStatus('intro');
    setFatalErrors([]);
    setTransitions({});
    setRunId(null);
  };

  // Écran final (bilan ou bad ending) : GAME_SCORE une seule fois par partie ; 0 si la partie est perdue.
  useEffect(() => {
    if (!ended || !runId) return;
    emitScoreOnce(runId, scoreForStudyNote(calculateGlobalScore(game), status === 'bad'), window.parent, window, () => window.localStorage);
  }, [ended, runId, status, game]);

  // ── Rendu ──
  // Scores toujours recalculés depuis l'état (l'état initial porte des scores de départ fictifs).
  const scored = useMemo(() => withScores(game), [game]);
  const globalScore = scored.scores.global;
  const grading = getGrading(globalScore);
  const activeChapter = chapters[active.chapterIndex] ?? chapters[0];
  const activeScene = timeline.scenes[active.chapterIndex];
  const activeStep = !active.inConnector && activeScene ? activeScene.steps[Math.max(0, active.stepIndex)]?.step : undefined;
  const activePhaseIndex = activeChapter.kind === 'phase' ? activeChapter.phaseIndex ?? 0 : -1;
  const activePhase = activePhaseIndex >= 0 ? phases[activePhaseIndex] : null;
  const phaseIsPast = activePhaseIndex >= 0 && (ended || activePhaseIndex < game.currentPhase);
  const selectionsFor = (phaseIndex: number) => {
    const phase = phases[phaseIndex];
    if (!ended && phaseIndex === game.currentPhase) return pending;
    return Object.fromEntries(phase.decisions.map((d) => [d.id, game.decisions[`${phase.id}-${d.id}`]]).filter(([, v]) => v));
  };
  const periodReport = (phaseIndex: number) => {
    const t = transitions[phaseIndex];
    if (!t) return null;
    return fill(story.copy.periodReport, {
      months: t.months,
      cashflow: (t.monthlyRevenue - t.monthlyCosts).toLocaleString('fr-FR'),
      budgetChange: signedEuro(t.budgetChange).replace(' €', ''),
    });
  };
  const spotX = activeStep?.kind === 'decision' ? activeChapter.hotspots?.[activeStep.index]?.[0] : undefined;
  const side = dockSide(view.current, spotX);
  const clara = guided && activePhase ? generateMessage(game, activePhase.id, 0)?.text ?? null : null;
  const connectorCopy = (index: number) => {
    const next = chapters[index + 1];
    if (status === 'bad' && next?.kind === 'finale') return story.collapseConnector;
    return story.connectors[story.chapters.indexOf(chapters[index])] ?? story.connectors[0];
  };
  const chapterNumber = (index: number) => String(index + 1).padStart(2, '0');

  return (
    <div
      className="story-root"
      data-reduced={reduced}
      data-step={activeStep?.kind ?? 'connector'}
      data-side={side}
      // L'indice de défilement n'apparaît qu'en tête de phase, quand défiler est la seule action attendue.
      data-hint={status === 'playing' && activePhase && activeStep?.kind === 'intro' ? 'on' : 'off'}
    >
      <a href="#story-main" className="sr-only focus:not-sr-only">Aller au contenu</a>

      <div ref={stageRef} className="story-stage" aria-hidden={false}>
        {mounted && chapters.map((chapter, index) => {
          const phaseIndex = chapter.kind === 'phase' ? chapter.phaseIndex ?? 0 : -1;
          const phase = phaseIndex >= 0 ? phases[phaseIndex] : null;
          const selections = phase ? selectionsFor(phaseIndex) : {};
          const isActive = !active.inConnector && active.chapterIndex === index;
          return (
            <SceneLayer
              key={chapter.id}
              ref={(el) => { layerRefs.current[index] = el; }}
              chapter={chapter}
              src={applyOverride(resolveStill(manifest, story.meta.sector, chapter.id), override)}
              eager={index < 2}
              hotspots={phase ? phase.decisions.map((d) => ({ picto: story.pictos[d.id] ?? 'compass', label: stripPrefix(d.title), done: !!selections[d.id] })) : []}
              activeHotspot={isActive && activeStep?.kind === 'decision' ? activeStep.index : -1}
              interactive={isActive && (status !== 'intro')}
              onHotspot={(decisionIndex) => goToStep(index, decisionIndex + 1)}
            />
          );
        })}
        <div className="story-vignette" aria-hidden="true" />
      </div>

      <header className="story-header">
        <div className="story-brand">
          <Picto name="bike" className="w-6 h-6" />
          <span>
            <strong>{story.meta.title}</strong>
            <i>{story.meta.kicker}</i>
          </span>
        </div>
        <nav className="story-route" aria-label="Chapitres">
          {chapters.map((chapter, index) => {
            const scene = timeline.scenes[index];
            const locked = scene.start > unlocked;
            return (
              <button
                key={chapter.id}
                type="button"
                disabled={locked}
                aria-current={active.chapterIndex === index ? 'step' : undefined}
                onClick={() => goToStep(index, 0)}
              >
                <span>{chapterNumber(index)}</span><i>{chapter.label}</i>
              </button>
            );
          })}
        </nav>
        <p className="story-status" aria-live="polite">{chapterNumber(active.chapterIndex)} — {activeChapter.label}</p>
        <div className="story-kpis" aria-label="Indicateurs">
          <span><i>Trésorerie</i>{euro(game.budget)}</span>
          <span><i>Score</i>{globalScore}/100</span>
        </div>
        <div className="story-tools">
          <button type="button" onClick={() => setLedgerOpen(true)} aria-label="Tableau de bord"><Picto name="chart" className="w-5 h-5" /><span>Tableau</span></button>
          <button type="button" onClick={() => setLexiconOpen(true)} aria-label="Lexique"><Picto name="book" className="w-5 h-5" /><span>Lexique</span></button>
        </div>
        <span className="story-progress" aria-hidden="true"><span ref={progressRef} /></span>
      </header>

      <main id="story-main" className="story-copy-layer">
        {chapters.map((chapter, index) => {
          const compact = active.chapterIndex === index && activeStep && activeStep.kind !== 'intro';
          return (
            <article
              key={chapter.id}
              ref={(el) => { copyRefs.current[index] = el; }}
              className="story-copy"
              data-position={chapter.copyPosition ?? 'left'}
              data-compact={compact ? 'true' : 'false'}
              style={{ opacity: index === 0 ? 1 : 0 }}
            >
              <p className="story-copy__index">{chapterNumber(index)} <span>/</span> {chapterNumber(chapters.length - 1)}</p>
              <p className="story-copy__eyebrow">{chapter.eyebrow}</p>
              <ChapterCopy
                chapter={chapter}
                phases={phases}
                periodReport={chapter.kind === 'phase' ? periodReport(chapter.phaseIndex ?? 0) : null}
                timeSkip={story.copy.timeSkip}
                status={status}
                objectives={story.objectives}
                startLabel={story.copy.start}
                onStart={handleStart}
                grade={{ label: stripEmoji(status === 'bad' ? theme.badEnding.title : grading.label), description: status === 'bad' ? theme.badEnding.description : grading.description }}
                globalScore={globalScore}
                onAnalysis={() => epilogueRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })}
              />
            </article>
          );
        })}

        {chapters.slice(0, -1).map((chapter, index) => {
          const c = connectorCopy(index);
          return (
            <div key={`${chapter.id}-connector`} ref={(el) => { captionRefs.current[index] = el; }} className="story-caption" style={{ opacity: 0 }} aria-hidden="true">
              <p>{c.caption}</p>
              <span>{c.detail}</span>
            </div>
          );
        })}

        {activePhase && activeStep && (
          <Dock
            key={`${activePhase.id}-${active.stepIndex}`}
            phase={activePhase}
            phaseNumber={activePhaseIndex + 1}
            phaseCount={phases.length}
            step={activeStep}
            pictos={story.pictos}
            selections={selectionsFor(activePhaseIndex)}
            readOnly={phaseIsPast}
            copy={story.copy as never}
            clara={clara}
            periodReport={periodReport(activePhaseIndex + 1)}
            onSelect={handleSelect}
            onStep={(stepIndex) => goToStep(active.chapterIndex, stepIndex)}
            onValidate={handleValidate}
          />
        )}
      </main>

      <div ref={hintRef} className="story-hint" aria-hidden="true">
        <span>{story.copy.scrollHint}</span>
        <Picto name="arrowDown" className="w-4 h-4" />
      </div>

      <div className="story-track" style={{ height: `${(unlocked + 1) * viewportHeight}px` }} aria-hidden="true" />

      {ended && (
        <Epilogue
          ref={epilogueRef}
          state={scored}
          phases={phases}
          bad={status === 'bad' ? theme.badEnding : null}
          fatalErrors={fatalErrors}
          globalScore={globalScore}
          discussion={story.discussion}
          onRestart={handleRestart}
          onExit={onExit}
        />
      )}

      <Ledger state={scored} open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
      <LexiconSidebar open={lexiconOpen} onClose={() => setLexiconOpen(false)} />
    </div>
  );
}

interface ChapterCopyProps {
  chapter: StoryChapter;
  phases: Phase[];
  periodReport: string | null;
  timeSkip: string;
  status: Status;
  objectives: string[];
  startLabel: string;
  onStart: () => void;
  grade: { label: string; description: string };
  globalScore: number;
  onAnalysis: () => void;
}

function ChapterCopy({ chapter, phases, periodReport, timeSkip, status, objectives, startLabel, onStart, grade, globalScore, onAnalysis }: ChapterCopyProps) {
  if (chapter.kind === 'opening') {
    return (
      <>
        <h1 className="story-copy__title">{chapter.title}</h1>
        <div className="story-copy__body">
          {chapter.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          <ul className="story-objectives">{objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
        {status === 'intro' && (
          <button type="button" className="story-cta" onClick={onStart}>{startLabel}</button>
        )}
      </>
    );
  }
  if (chapter.kind === 'phase') {
    const phase = phases[chapter.phaseIndex ?? 0];
    return (
      <>
        <h2 className="story-copy__title">{stripPrefix(phase.title)}</h2>
        <div className="story-copy__body">
          <p>{phase.context}</p>
          {periodReport && <p className="story-copy__report">{periodReport}</p>}
          {phase.currentSituation && <p className="story-copy__report">{timeSkip}</p>}
        </div>
      </>
    );
  }
  return (
    <>
      <h2 className="story-copy__title">{grade.label}</h2>
      <p className="story-score"><strong>{globalScore}</strong><span>/100</span></p>
      <div className="story-copy__body"><p>{grade.description}</p></div>
      <button type="button" className="story-cta" onClick={onAnalysis}>Lire l&apos;analyse <Picto name="arrowDown" className="w-4 h-4" /></button>
    </>
  );
}
