export const euro = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} €`;
export const signedEuro = (value: number) => `${value >= 0 ? '+' : '−'}${Math.abs(Math.round(value)).toLocaleString('fr-FR')} €`;

/** Retire « Phase 1 : » / « Décision 2 : » / « Dilemme 3 : » des titres de données. */
export const stripPrefix = (title: string) => title.replace(/^(Phase|Décision|Dilemme)\s*\d+\s*:\s*/i, '');

/** Les libellés de notation contiennent des emojis : on les retire de la mise en scène. */
export const stripEmoji = (text: string) => text.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

export const COST_LABELS: Record<string, string> = {
  salaries: 'Salaires',
  materials: 'Matières premières',
  maintenance: 'Maintenance',
  rent: 'Loyer',
  insurance: 'Assurances',
  marketing: 'Marketing',
  vandalism: 'Vandalisme / vols',
};
