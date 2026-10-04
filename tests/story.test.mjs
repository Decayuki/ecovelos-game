// Scènes de la traversée : contenu (story.json), manifeste d'assets, timeline, verrous, caméra, replis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync } from 'node:fs';
import story from '../content/story.json' with { type: 'json' };
import assets from '../content/assets.json' with { type: 'json' };
import ecovelos from '../lib/game-data.json' with { type: 'json' };
import {
  buildTimeline, locate, unlockedUntil, stepPosition, visibleChapters, layerFrames, coverBox, frame, decisionFraming, dockSide,
  sceneShot, LOCK_EPSILON,
} from '../lib/story/timeline.ts';
import { resolveStill, applyOverride, mediaOverride } from '../lib/story/assets.ts';

const counts = ecovelos.phases.map((p) => p.decisions.length);
const spans = story.meta.spans;
const VIEWS = [{ width: 1280, height: 800 }, { width: 375, height: 812 }, { width: 1920, height: 1080 }, { width: 768, height: 1024 }];

test('story.json : chapitres uniques, connecteurs = chapitres − 1, phases couvertes', () => {
  const ids = story.chapters.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(story.connectors.length, story.chapters.length - 1);
  const phases = story.chapters.filter((c) => c.kind === 'phase');
  assert.deepEqual(phases.map((c) => c.phaseIndex), [0, 1, 2]);
  assert.equal(story.chapters[0].kind, 'opening');
  assert.equal(story.chapters.at(-1).kind, 'finale');
});

test('chaque décision a son point d’intérêt (dans l’image) et son picto', () => {
  const picto = readFileSync(new URL('../components/story/Picto.tsx', import.meta.url), 'utf8');
  for (const chapter of story.chapters.filter((c) => c.kind === 'phase')) {
    const phase = ecovelos.phases[chapter.phaseIndex];
    assert.equal(chapter.hotspots.length, phase.decisions.length, chapter.id);
    for (const [x, y] of chapter.hotspots) assert.ok(x > 5 && x < 95 && y > 5 && y < 95, `${chapter.id} ${x},${y}`);
    for (const d of phase.decisions) {
      const name = story.pictos[d.id];
      assert.ok(name, `picto manquant pour ${d.id}`);
      assert.ok(picto.includes(`  ${name}:`), `picto ${name} non dessiné`);
    }
  }
});

test('manifeste : ÉcoVélos prêt, fichiers présents et sous le poids cible ; prompts complets partout', () => {
  const { width, height } = assets.output.generate;
  assert.ok(width && height);
  for (const [key, still] of Object.entries(assets.stills)) {
    assert.ok(still.prompt.length > 40 && still.palette && still.identity, key);
    assert.match(still.src, /^\/story\/[a-z]+\/\d\d-[a-z]+\.webp$/);
    if (still.status === 'ready') {
      const file = new URL(`../public${still.src}`, import.meta.url);
      assert.ok(existsSync(file), `${key} déclaré prêt mais absent`);
      assert.ok(statSync(file).size / 1024 <= assets.output.deliver.targetKB, `${key} trop lourd`);
    }
  }
  for (const c of story.chapters) assert.equal(assets.stills[`ecovelos/${c.id}`].status, 'ready', c.id);
});

test('repli média : pending → procédural, ?media=off|broken pour la recette', () => {
  const manifest = { stills: { 'x/01': { status: 'pending', src: '/a.webp' }, 'x/02': { status: 'ready', src: '/b.webp' } } };
  assert.equal(resolveStill(manifest, 'x', '01'), null);
  assert.equal(resolveStill(manifest, 'x', '02'), '/b.webp');
  assert.equal(resolveStill(manifest, 'x', '99'), null);
  assert.equal(mediaOverride('?media=off'), 'off');
  assert.equal(mediaOverride('?media=broken&x=1'), 'broken');
  assert.equal(mediaOverride('?media=yes'), null);
  assert.equal(applyOverride('/b.webp', 'off'), null);
  assert.equal(applyOverride('/b.webp', 'broken'), '/b.webp.missing');
  assert.equal(applyOverride('/b.webp', null), '/b.webp');
});

test('timeline : scène → connecteur → scène, étapes intro/décisions/validation', () => {
  const tl = buildTimeline(story.chapters, counts, spans);
  assert.deepEqual(tl.segments.map((s) => s.kind), ['scene', 'connector', 'scene', 'connector', 'scene', 'connector', 'scene', 'connector', 'scene']);
  assert.deepEqual(tl.scenes[1].steps.map((s) => s.step.kind), ['intro', 'decision', 'decision', 'decision', 'validate']);
  assert.deepEqual(tl.scenes[2].steps.map((s) => s.step.kind), ['intro', 'decision', 'validate']);
  for (let i = 1; i < tl.segments.length; i++) assert.equal(tl.segments[i].start, tl.segments[i - 1].end);
  const at = locate(tl, stepPosition(tl, 1, 2));
  assert.equal(at.segment.chapterIndex, 1);
  assert.deepEqual(at.segment.steps[at.stepIndex].step, { kind: 'decision', index: 1 });
  // Connecteur : le chapitre lu bascule à mi-chemin.
  const c = tl.segments[1];
  assert.equal(locate(tl, c.start + 0.1).chapterIndex, 0);
  assert.equal(locate(tl, c.end - 0.1).chapterIndex, 1);
  assert.equal(locate(tl, tl.total + 5).segment, tl.segments.at(-1));
});

test('verrous : on ne traverse un connecteur qu’après validation de la phase', () => {
  const tl = buildTimeline(story.chapters, counts, spans);
  const lockIntro = unlockedUntil(tl, story.chapters, { started: false, currentPhase: 0, ended: false });
  assert.equal(locate(tl, lockIntro).segment.kind, 'scene');
  assert.equal(locate(tl, lockIntro).segment.chapterIndex, 0);
  for (let phase = 0; phase < 3; phase++) {
    const max = unlockedUntil(tl, story.chapters, { started: true, currentPhase: phase, ended: false });
    const at = locate(tl, max);
    assert.equal(at.segment.kind, 'scene', `phase ${phase}`);
    assert.equal(at.segment.steps[at.stepIndex].step.kind, 'validate');
    assert.equal(locate(tl, max + LOCK_EPSILON * 2).segment.kind, 'connector');
  }
  assert.equal(unlockedUntil(tl, story.chapters, { started: true, currentPhase: 2, ended: true }), tl.total);
});

test('bad ending : les phases non jouées disparaissent, le bilan suit directement', () => {
  const chapters = visibleChapters(story.chapters, 1);
  assert.deepEqual(chapters.map((c) => c.id), ['00-ouverture', '01-lancement', '02-partenariat', '04-bilan']);
  assert.equal(visibleChapters(story.chapters, null).length, 5);
});

test('caméra : aucun bord d’image découvert, à toute position et sur tout écran', () => {
  const tl = buildTimeline(story.chapters, counts, spans);
  for (const view of VIEWS) {
    const box = coverBox(view);
    assert.ok(box.width >= view.width - 1e-6 && box.height >= view.height - 1e-6);
    for (const reduced of [false, true]) {
      for (let pos = 0; pos <= tl.total; pos += 0.05) {
        for (const f of layerFrames(tl, story.chapters, pos, view, reduced)) {
          assert.ok(f.opacity >= 0 && f.opacity <= 1);
          assert.ok(f.scale >= 1);
          // Bord gauche/droit visible de l'image, en px écran.
          const left = view.width / 2 - f.scale * (box.width / 2 - (f.tx / 100) * box.width);
          const right = view.width / 2 + f.scale * (box.width / 2 + (f.tx / 100) * box.width);
          const top = view.height / 2 - f.scale * (box.height / 2 - (f.ty / 100) * box.height);
          const bottom = view.height / 2 + f.scale * (box.height / 2 + (f.ty / 100) * box.height);
          assert.ok(left <= 0.5 && right >= view.width - 0.5 && top <= 0.5 && bottom >= view.height - 0.5, `${view.width}x${view.height} pos ${pos.toFixed(2)}`);
        }
      }
    }
  }
});

test('caméra : en décision, le point d’intérêt est à l’écran et hors des panneaux', () => {
  const tl = buildTimeline(story.chapters, counts, spans);
  for (const view of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
    const box = coverBox(view);
    const framing = decisionFraming(view);
    story.chapters.forEach((chapter, ci) => {
      (chapter.hotspots ?? []).forEach(([hx, hy], di) => {
        const pos = stepPosition(tl, ci, di + 1);
        const shot = sceneShot(chapter, tl.scenes[ci], pos, false, framing);
        const { tx, ty } = frame(shot, view, box);
        const sx = view.width / 2 + shot.scale * ((hx - 50 + tx) / 100) * box.width;
        const sy = view.height / 2 + shot.scale * ((hy - 50 + ty) / 100) * box.height;
        assert.ok(sx > 24 && sx < view.width - 24, `${chapter.id}#${di} x=${sx.toFixed(0)} @${view.width}`);
        if (view.width <= 760) assert.ok(sy > 90 && sy < view.height * 0.38, `${chapter.id}#${di} y=${sy.toFixed(0)} doit rester au-dessus du panneau bas`);
        else if (dockSide(view, hx) === 'right') assert.ok(sx < view.width * 0.6, `${chapter.id}#${di} sous le panneau de droite`);
        else assert.ok(sx > view.width * 0.42, `${chapter.id}#${di} sous le panneau de gauche`);
      });
    });
  }
});

test('mouvement réduit : plans fixes (pas de travelling) et fondu enchaîné en connecteur', () => {
  const tl = buildTimeline(story.chapters, counts, spans);
  const view = { width: 1280, height: 800 };
  const scene = tl.scenes[1];
  const intro = scene.steps[0];
  const a = layerFrames(tl, story.chapters, intro.start + 0.05, view, true)[0];
  const b = layerFrames(tl, story.chapters, intro.end - 0.05, view, true)[0];
  assert.deepEqual(a, b);
  const connector = tl.segments[1];
  const mid = layerFrames(tl, story.chapters, (connector.start + connector.end) / 2, view, true);
  assert.equal(mid.length, 2);
  for (const f of mid) assert.ok(f.scale <= 1.32 + 1e-9);
  assert.ok(Math.abs(mid[0].opacity + mid[1].opacity - 1) < 1e-9);
});
