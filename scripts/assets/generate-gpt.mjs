#!/usr/bin/env node
// Génère les stills de scène avec la génération d'images GPT (outil image_gen intégré
// à Codex CLI, compte ChatGPT — aucune clé API dans le dépôt) puis les livre en WebP.
// Seuls content/assets.json et public/story/** sont écrits : jamais le code.
//
//   node scripts/assets/generate-gpt.mjs <secteur|all> [--only 01-lancement] [--force] [--jobs 3]
//
// Prérequis : codex (connecté), cwebp. Les échecs sont rapportés, jamais réessayés en boucle.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = join(root, 'content', 'assets.json');
const args = process.argv.slice(2);
const sector = args[0];
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const jobs = args.includes('--jobs') ? Number(args[args.indexOf('--jobs') + 1]) : 3;
if (!sector) {
  console.error('usage: generate-gpt.mjs <secteur|all> [--only <chapitre>] [--force] [--jobs n]');
  process.exit(1);
}

const readManifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));
const manifest = readManifest();
const queue = Object.entries(manifest.stills).filter(([key, still]) => {
  const [s, c] = key.split('/');
  return (sector === 'all' || s === sector) && (!only || c === only) && (force || still.status !== 'ready');
});

const run = (cmd, argv, opts = {}) => new Promise((resolve) => {
  const child = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  child.on('close', (code) => resolve({ code, log }));
});

async function generate([key, still]) {
  const prompt = `${manifest.style.replace('{palette}', still.palette).replace('{identity}', still.identity)} Scene: ${still.prompt}`;
  const { width, height } = manifest.output.generate;
  const dir = mkdtempSync(join(tmpdir(), 'stillgen-'));
  const task = `Use your built-in image generation tool to create exactly ONE landscape image, ${width}x${height}. `
    + `Prompt: "${prompt}" Save the image in the current directory as still.png. Do nothing else.`;
  const gen = await run('codex', ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', dir, task]);
  const png = readdirSync(dir).find((f) => f.endsWith('.png'));
  if (gen.code !== 0 || !png) return { key, ok: false, reason: `codex exit ${gen.code}, aucun PNG (${dir})` };
  const out = join(root, 'public', still.src);
  mkdirSync(dirname(out), { recursive: true });
  const { width: w, quality } = manifest.output.deliver;
  const conv = await run('cwebp', ['-quiet', '-q', String(quality), '-resize', String(w), '0', join(dir, png), '-o', out]);
  if (conv.code !== 0) return { key, ok: false, reason: 'cwebp a échoué' };
  return { key, ok: true, kb: Math.round(statSync(out).size / 1024), prompt };
}

const results = [];
const pending = [...queue];
await Promise.all(Array.from({ length: Math.min(jobs, pending.length) }, async () => {
  while (pending.length) {
    const item = pending.shift();
    const result = await generate(item);
    results.push(result);
    console.log(result.ok ? `✓ ${result.key} (${result.kb} Ko)` : `✗ ${result.key} — ${result.reason}`);
    if (result.ok) {
      // Relecture à chaque écriture : plusieurs jobs se partagent le manifeste.
      const fresh = readManifest();
      Object.assign(fresh.stills[result.key], {
        status: 'ready', provider: manifest.provider, generatedAt: new Date().toISOString().slice(0, 10), sizeKB: result.kb,
      });
      writeFileSync(manifestPath, `${JSON.stringify(fresh, null, 2)}\n`);
    }
  }
}));
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed}/${results.length} stills livrés`);
process.exit(failed ? 1 : 0);
