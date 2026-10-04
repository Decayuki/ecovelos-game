'use client';

import { useEffect, useRef } from 'react';
import type { GameState, Scores } from '@/lib/types';
import { calculateVA } from '@/lib/calculations';
import { totalMonthlyCosts } from '@/lib/engine';
import { getBudgetTooltip, getVATooltip } from '@/lib/tooltips';
import Picto from './Picto';
import { COST_LABELS, euro, signedEuro } from './format';

export function ScoreBars({ scores }: { scores: Scores }) {
  const rows: [string, number][] = [
    ['Économique', scores.economic],
    ['Social', scores.social],
    ['Environnemental', scores.environmental],
  ];
  return (
    <dl className="story-bars">
      {rows.map(([label, value]) => (
        <div key={label} className="story-bars__row">
          <dt>{label}</dt>
          <dd>
            <span className="story-bars__track" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0, Math.min(100, value)) / 100})` }} /></span>
            <span className="story-bars__value">{Math.round(value)}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function LedgerFigures({ state }: { state: GameState }) {
  const va = calculateVA(state.monthlyRevenue, state.monthlyCosts);
  const costs = totalMonthlyCosts(state);
  return (
    <>
      <dl className="story-figures">
        <div><dt>Trésorerie</dt><dd>{euro(state.budget)}</dd></div>
        <div><dt>CA mensuel</dt><dd>{euro(state.monthlyRevenue)}</dd></div>
        <div><dt>Coûts mensuels</dt><dd>{euro(costs)}</dd></div>
        <div data-tone={va >= 0 ? 'up' : 'down'}><dt>Valeur ajoutée</dt><dd>{signedEuro(va)}</dd></div>
      </dl>
      <dl className="story-figures story-figures--small">
        {state.fleet !== undefined && <div><dt>Flotte</dt><dd>{state.fleet} vélos</dd></div>}
        <div><dt>Salariés</dt><dd>{state.employees}</dd></div>
        {state.utilizationRate !== undefined && <div><dt>Utilisation</dt><dd>{Math.round(state.utilizationRate * 100)} %</dd></div>}
      </dl>
    </>
  );
}

export default function Ledger({ state, open, onClose }: { state: GameState; open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const va = calculateVA(state.monthlyRevenue, state.monthlyCosts);
  const vaHelp = getVATooltip(va);
  const budgetHelp = getBudgetTooltip(state.budget);
  return (
    <div className="story-drawer" role="dialog" aria-modal="true" aria-labelledby="ledger-title">
      <button type="button" className="story-drawer__scrim" aria-label="Fermer le tableau de bord" onClick={onClose} />
      <div className="story-drawer__panel">
        <div className="story-drawer__head">
          <h2 id="ledger-title"><Picto name="chart" className="w-5 h-5" /> Tableau de bord</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer"><Picto name="close" className="w-5 h-5" /></button>
        </div>
        <LedgerFigures state={state} />
        <p className="story-help"><strong>VA = CA − coûts.</strong> {vaHelp.context} {vaHelp.advice}</p>
        <p className="story-help">{budgetHelp.context}</p>
        <h3 className="story-drawer__sub">Répartition des coûts mensuels</h3>
        <ul className="story-costs">
          {Object.entries(state.monthlyCosts).filter(([, v]) => v !== undefined).map(([key, value]) => (
            <li key={key}><span>{COST_LABELS[key] ?? key}</span><span>{euro(value as number)}</span></li>
          ))}
        </ul>
        <h3 className="story-drawer__sub">Scores</h3>
        <ScoreBars scores={state.scores} />
        <p className="story-help">Score global : {state.scores.global}/100 (économique 40 %, social 30 %, environnemental 30 %).</p>
      </div>
    </div>
  );
}
