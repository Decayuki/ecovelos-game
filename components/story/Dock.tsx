'use client';

import type { Decision, Option, Phase } from '@/lib/types';
import type { Step } from '@/lib/story/timeline';
import Picto from './Picto';
import { euro, stripPrefix } from './format';

interface DockCopy {
  decisionNext: string;
  toValidate: string;
  validate: string;
  finish: string;
  validated: string;
  missing: string;
}

interface DockProps {
  phase: Phase;
  phaseNumber: number;
  phaseCount: number;
  step: Step;
  pictos: Record<string, string>;
  selections: Record<string, string>;
  readOnly: boolean;
  copy: DockCopy;
  clara: string | null;
  periodReport: string | null;
  onSelect: (decisionId: string, optionId: string) => void;
  onStep: (stepIndex: number) => void;
  onValidate: () => void;
}

/** Le panneau d'action posé dans la scène : une décision par plan, puis la validation de phase. */
export default function Dock(props: DockProps) {
  const { phase, step } = props;
  if (step.kind === 'intro') {
    return (
      <section className="story-dock story-dock--intro" aria-label="Décisions de la phase">
        <p className="story-dock__kicker">{phase.decisions.length > 1 ? `${phase.decisions.length} décisions vous attendent` : 'Une décision vous attend'}</p>
        <ol className="story-dock__agenda">
          {phase.decisions.map((decision, index) => (
            <li key={decision.id}>
              <button type="button" onClick={() => props.onStep(index + 1)}>
                <Picto name={props.pictos[decision.id] ?? 'compass'} className="w-4 h-4" />
                <span>{stripPrefix(decision.title)}</span>
                {props.selections[decision.id] && <Picto name="check" className="w-4 h-4 story-ok" title="Décidé" />}
              </button>
            </li>
          ))}
        </ol>
      </section>
    );
  }
  if (step.kind === 'decision') {
    const decision = phase.decisions[step.index];
    return <DecisionPanel {...props} decision={decision} index={step.index} />;
  }
  return <ValidatePanel {...props} />;
}

function OptionFacts({ option }: { option: Option }) {
  const facts: string[] = [];
  if (option.cost && option.cost > 0) facts.push(`Coût ${euro(option.cost)}`);
  if (option.monthlyIncrease && option.monthlyIncrease > 0) facts.push(`+${euro(option.monthlyIncrease)}/mois`);
  if (option.revenue) facts.push(`+${euro(option.revenue)}`);
  if (!facts.length) return null;
  return <span className="story-option__facts">{facts.join(' · ')}</span>;
}

function DecisionPanel({ decision, index, phase, selections, readOnly, onSelect, onStep, pictos, copy, clara }: DockProps & { decision: Decision; index: number }) {
  const selected = selections[decision.id];
  const isLast = index === phase.decisions.length - 1;
  const titleId = `decision-${phase.id}-${decision.id}`;
  return (
    <section className="story-dock" aria-labelledby={titleId}>
      <p className="story-dock__kicker">
        <Picto name={pictos[decision.id] ?? 'compass'} className="w-4 h-4" />
        Décision {index + 1}/{phase.decisions.length}
      </p>
      <h3 id={titleId} className="story-dock__title">{stripPrefix(decision.title)}</h3>
      <p className="story-dock__question">{decision.question}</p>
      {clara && !readOnly && (
        <p className="story-clara"><strong>Clara</strong> {clara}</p>
      )}
      <div role="radiogroup" aria-labelledby={titleId} className="story-options">
        {decision.options.map((option) => {
          const checked = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={readOnly && !checked}
              className="story-option"
              onClick={() => !readOnly && onSelect(decision.id, option.id)}
            >
              <span className="story-option__mark" aria-hidden="true">{checked ? <Picto name="check" className="w-3.5 h-3.5" /> : option.id}</span>
              <span className="story-option__body">
                <span className="story-option__label">{option.label}</span>
                <OptionFacts option={option} />
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <button type="button" className="story-next" onClick={() => onStep(index + 2)}>
          {isLast ? copy.toValidate : copy.decisionNext}
          <Picto name="arrowDown" className="w-4 h-4" />
        </button>
      )}
    </section>
  );
}

function ValidatePanel({ phase, phaseNumber, phaseCount, selections, readOnly, copy, onValidate, onStep, pictos, periodReport }: DockProps) {
  const missing = phase.decisions.filter((d) => !selections[d.id]);
  return (
    <section className="story-dock" aria-label="Validation de la phase">
      <p className="story-dock__kicker">{readOnly ? copy.validated : `Phase ${phaseNumber}/${phaseCount}`}</p>
      <ul className="story-recap">
        {phase.decisions.map((decision, index) => {
          const option = decision.options.find((o) => o.id === selections[decision.id]);
          return (
            <li key={decision.id}>
              <button type="button" onClick={() => onStep(index + 1)} className="story-recap__row">
                <Picto name={pictos[decision.id] ?? 'compass'} className="w-4 h-4" />
                <span>
                  <span className="story-recap__title">{stripPrefix(decision.title)}</span>
                  <span className={option ? 'story-recap__choice' : 'story-recap__missing'}>
                    {option ? option.label : copy.missing}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {readOnly ? (
        periodReport && <p className="story-dock__note">{periodReport}</p>
      ) : (
        <button type="button" className="story-cta" disabled={missing.length > 0} onClick={onValidate}>
          {phaseNumber === phaseCount ? copy.finish : copy.validate}
        </button>
      )}
      {!readOnly && missing.length > 0 && (
        <p className="story-dock__note">{missing.length === 1 ? 'Il reste une décision à prendre.' : `Il reste ${missing.length} décisions à prendre.`}</p>
      )}
    </section>
  );
}
