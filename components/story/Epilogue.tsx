'use client';

import { forwardRef, useState } from 'react';
import type { BadEnding, GameState, Phase } from '@/lib/types';
import StudentInstructions from '@/components/StudentInstructions';
import Picto from './Picto';
import { LedgerFigures, ScoreBars } from './Ledger';
import { stripPrefix } from './format';

interface EpilogueProps {
  state: GameState;
  phases: Phase[];
  bad: BadEnding | null;
  fatalErrors: string[];
  globalScore: number;
  discussion: string[];
  onRestart: () => void;
  onExit: () => void;
}

/** Après la dernière scène : le document de bilan, en flux normal au-dessus de la scène figée. */
const Epilogue = forwardRef<HTMLElement, EpilogueProps>(function Epilogue(
  { state, phases, bad, fatalErrors, globalScore, discussion, onRestart, onExit },
  ref,
) {
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <section ref={ref} id="analyse" className="story-epilogue" aria-label="Analyse de la partie">
      <div className="story-epilogue__inner">
        {bad && (
          <div className="story-block story-block--alert">
            <h2><Picto name="alert" className="w-5 h-5" /> {bad.title}</h2>
            <p>{bad.description}</p>
            <ul>{bad.consequences.map((c) => <li key={c}>{c}</li>)}</ul>
            {bad.roast && <p className="story-quote">« {bad.roast} »</p>}
            {fatalErrors.length > 0 && (
              <>
                <h3>Ce qui a fait tomber l&apos;entreprise</h3>
                <ul>{fatalErrors.map((e) => <li key={e}>{e}</li>)}</ul>
              </>
            )}
          </div>
        )}

        <div className="story-block">
          <h2>Résultat · {globalScore}/100</h2>
          <ScoreBars scores={state.scores} />
          <LedgerFigures state={state} />
        </div>

        <div className="story-block">
          <h2>Analyse de vos décisions</h2>
          {phases.map((phase) => (
            <div key={phase.id} className="story-analysis">
              <h3>{stripPrefix(phase.title)}</h3>
              <ul>
                {phase.decisions.map((decision) => {
                  const chosen = state.decisions[`${phase.id}-${decision.id}`];
                  const option = decision.options.find((o) => o.id === chosen);
                  return (
                    <li key={decision.id}>
                      <strong>{stripPrefix(decision.title)}</strong> : {option ? option.label.split('(')[0].trim() : 'Non joué'}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="story-block">
          <h2>Points de discussion</h2>
          <ul>{discussion.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>

        <div className="story-block story-block--light">
          {showInstructions ? (
            <StudentInstructions onClose={() => setShowInstructions(false)} />
          ) : (
            <div className="story-instructions">
              <p><strong>Et maintenant ?</strong> Vous devez rédiger un cours sur ce chapitre.</p>
              <button type="button" className="story-cta" onClick={() => setShowInstructions(true)}>
                <Picto name="book" className="w-4 h-4" /> Voir les consignes
              </button>
            </div>
          )}
        </div>

        <div className="story-actions">
          <button type="button" className="story-cta" onClick={onRestart}>Rejouer ÉcoVélos</button>
          <button type="button" className="story-ghost" onClick={onExit}>Changer de secteur</button>
        </div>
      </div>
    </section>
  );
});

export default Epilogue;
