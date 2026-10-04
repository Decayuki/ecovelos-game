// Contrat GAME_SCORE (StudyNote GameEmbed, identique à SGN11 v2).
// Node >= 23.6 : import direct du module TS (type stripping natif).
import test from 'node:test';
import assert from 'node:assert/strict';
import { emitScoreOnce, newRunId } from '../lib/game-score.ts';

const memoryStorage = () => {
  const values = new Map();
  return { values, api: () => ({ getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) }) };
};

test('GAME_SCORE émis une seule fois par partie, au format du contrat', () => {
  const { api } = memoryStorage();
  const messages = [];
  const parent = { postMessage: (...args) => messages.push(args) };
  const self = {};
  assert.equal(emitScoreOnce('run-a', 72, parent, self, api), true);
  assert.equal(emitScoreOnce('run-a', 72, parent, self, api), false);
  assert.equal(emitScoreOnce('run-a', 10, parent, self, api), false);
  assert.deepEqual(messages, [[{ type: 'GAME_SCORE', score: 72 }, '*']]);
  // Une nouvelle partie (REJOUER) a son propre runId : nouvelle émission.
  assert.equal(emitScoreOnce('run-b', 35, parent, self, api), true);
  assert.deepEqual(messages[1], [{ type: 'GAME_SCORE', score: 35 }, '*']);
});

test('rien émis hors iframe, sans runId ou avec un score non fini', () => {
  const { api } = memoryStorage();
  const messages = [];
  const self = { postMessage: (...args) => messages.push(args) };
  assert.equal(emitScoreOnce('run-root', 50, self, self, api), false);
  const parent = { postMessage: (...args) => messages.push(args) };
  assert.equal(emitScoreOnce('', 50, parent, {}, api), false);
  assert.equal(emitScoreOnce('run-nan', NaN, parent, {}, api), false);
  assert.deepEqual(messages, []);
});

test('score entier borné 0–100', () => {
  const { api } = memoryStorage();
  const messages = [];
  const parent = { postMessage: (m) => messages.push(m.score) };
  emitScoreOnce('clamp-hi', 140.4, parent, {}, api);
  emitScoreOnce('clamp-lo', -3, parent, {}, api);
  emitScoreOnce('round', 64.6, parent, {}, api);
  assert.deepEqual(messages, [100, 0, 65]);
});

test('marqueur localStorage respecté ; stockage bloqué toléré', () => {
  const { values, api } = memoryStorage();
  const messages = [];
  const parent = { postMessage: (...args) => messages.push(args) };
  values.set('ecovelos:score:previous-document', 'sent');
  assert.equal(emitScoreOnce('previous-document', 80, parent, {}, api), false);
  assert.equal(emitScoreOnce('fresh', 80, parent, {}, api), true);
  assert.equal(values.get('ecovelos:score:fresh'), 'sent');
  const denied = () => { throw new Error('denied'); };
  assert.equal(emitScoreOnce('denied', 40, parent, {}, denied), true);
  assert.equal(emitScoreOnce('denied', 40, parent, {}, denied), false);
  assert.equal(messages.length, 2);
});

test('newRunId produit des identifiants distincts', () => {
  assert.notEqual(newRunId(), newRunId());
});
