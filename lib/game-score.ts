// Contrat StudyNote GameEmbed (identique à SGN11 v2) :
// window.parent.postMessage({ type: 'GAME_SCORE', score }, '*'), score entier 0–100,
// émis une seule fois par partie, à l'écran final (bilan ou bad ending).
// Aucun appel réseau : StudyNote vérifie l'origine et crédite côté serveur.

export interface ScoreTarget {
  postMessage(message: unknown, targetOrigin: string): void;
}

export interface ScoreStorage {
  getItem(key: string): string | null | undefined;
  setItem(key: string, value: string): void;
}

export function newRunId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const sentInDocument = new Set<string>();

export function emitScoreOnce(
  runId: string,
  rawScore: number,
  parent: ScoreTarget,
  self: unknown,
  storage: () => ScoreStorage
): boolean {
  // À la racine (hors iframe), parent === self : on n'émet rien.
  if (!runId || parent === self || sentInDocument.has(runId) || !Number.isFinite(rawScore)) return false;
  const key = `ecovelos:score:${runId}`;
  try { if (storage().getItem(key) === 'sent') return false; } catch { /* storage bloqué en iframe tierce */ }
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  // Le contrat GameEmbed n'a pas d'ACK : on marque avant d'envoyer (at-most-once plutôt
  // que des renvois) ; l'idempotence de la récompense reste à la charge de StudyNote.
  sentInDocument.add(runId);
  try { storage().setItem(key, 'sent'); } catch { /* la déduplication document suffit */ }
  parent.postMessage({ type: 'GAME_SCORE', score }, '*');
  return true;
}
