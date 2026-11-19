import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Scale } from 'lucide-react';
import {
  AccusationSubmission,
  CaseDefinition,
  InvestigationState,
  SuspectId,
} from '../types/game';
import { reorderTimelineList } from '../engine/timelineEngine';

interface FinalDeductionViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onPresentCase: (submission: AccusationSubmission) => void;
}

export const FinalDeductionView: React.FC<FinalDeductionViewProps> = ({
  caseDef,
  state,
  onPresentCase,
}) => {
  const initialBeats = caseDef.timelineEvents
    .filter((t) => t.isCrimeReconstructionBeat)
    .map((t) => t.id)
    // Shuffle deterministically so the player actively sequences the crime
    .sort((a, b) => a.localeCompare(b));

  const [murdererId, setMurdererId] = useState<SuspectId | ''>('');
  const [motiveId, setMotiveId] = useState('');
  const [methodId, setMethodId] = useState('');
  const [opportunityId, setOpportunityId] = useState('');
  const [timeOfDeathId, setTimeOfDeathId] = useState('');
  const [decisiveEvidenceIds, setDecisiveEvidenceIds] = useState<string[]>([]);
  const [falseStatementId, setFalseStatementId] = useState('');
  const [killersMistakeId, setKillersMistakeId] = useState('');
  const [reconstructionOrder, setReconstructionOrder] = useState<string[]>(initialBeats);

  const discoveredEvidence = caseDef.evidence.filter((e) =>
    state.discoveredEvidenceIds.includes(e.id)
  );

  const toggleEvidence = (id: string) => {
    setDecisiveEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPresentCase({
      murdererId,
      motiveId,
      methodId,
      opportunityId,
      timeOfDeathId,
      decisiveEvidenceIds,
      falseStatementId,
      killersMistakeId,
      reconstructionOrder,
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#c99a4b]/25 pb-4">
        <Scale className="w-6 h-6 text-[#c99a4b]" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#f2eadc]">
            Final Deduction & Accusation
          </h1>
          <p className="text-sm text-[#a89b88]">
            Assemble your complete case for Inspector Harrow and reconstruct the exact sequence of
            the crime before presenting your verdict.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Murderer */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-murderer" className="block font-display text-sm text-[#c99a4b]">
              1. Who killed Sir Reginald Ashcroft?
            </label>
            <select
              id="acc-murderer"
              value={murdererId}
              onChange={(e) => setMurdererId(e.target.value as SuspectId | '')}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select Suspect --</option>
              {caseDef.suspects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.occupation})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Motive */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-motive" className="block font-display text-sm text-[#c99a4b]">
              2. Why did they commit the murder?
            </label>
            <select
              id="acc-motive"
              value={motiveId}
              onChange={(e) => setMotiveId(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select Motive --</option>
              {caseDef.accusationChoices.motives.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Method */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-method" className="block font-display text-sm text-[#c99a4b]">
              3. How was the murder & locked room achieved?
            </label>
            <select
              id="acc-method"
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select Method --</option>
              {caseDef.accusationChoices.methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Opportunity */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-opp" className="block font-display text-sm text-[#c99a4b]">
              4. How did they secure opportunity?
            </label>
            <select
              id="acc-opp"
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select Opportunity --</option>
              {caseDef.accusationChoices.opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Time of Death */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-tod" className="block font-display text-sm text-[#c99a4b]">
              5. When did Sir Reginald actually collapse?
            </label>
            <select
              id="acc-tod"
              value={timeOfDeathId}
              onChange={(e) => setTimeOfDeathId(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select Window --</option>
              {caseDef.accusationChoices.timesOfDeath.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. False Statement */}
          <div className="leather-surface rounded-md p-5 space-y-2">
            <label htmlFor="acc-false" className="block font-display text-sm text-[#c99a4b]">
              6. Which statement was the decisive alibi lie?
            </label>
            <select
              id="acc-false"
              value={falseStatementId}
              onChange={(e) => setFalseStatementId(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
            >
              <option value="">-- Select False Statement --</option>
              {caseDef.accusationChoices.falseStatements.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 7. Killer's Mistake */}
        <div className="leather-surface rounded-md p-5 space-y-2">
          <label htmlFor="acc-mistake" className="block font-display text-sm text-[#c99a4b]">
            7. What tiny overlooked detail exposed the murderer?
          </label>
          <select
            id="acc-mistake"
            value={killersMistakeId}
            onChange={(e) => setKillersMistakeId(e.target.value)}
            className="w-full px-3 py-2.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 text-sm text-[#f2eadc]"
          >
            <option value="">-- Select Overlooked Mistake --</option>
            {caseDef.accusationChoices.killersMistakes.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        {/* 8. Decisive Evidence Multi-Select */}
        <div className="leather-surface rounded-md p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-display text-sm text-[#c99a4b]">
              8. What proves it? (Select decisive exhibits)
            </span>
            <span className="font-mono-tabular text-xs text-[#a89b88]">
              Selected: {decisiveEvidenceIds.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {discoveredEvidence.map((ev) => {
              const checked = decisiveEvidenceIds.includes(ev.id);
              return (
                <label
                  key={ev.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                    checked
                      ? 'bg-[#2a2117] border-[#c99a4b] text-[#f2eadc]'
                      : 'bg-[#120f0d] border-white/10 text-[#cbbba0]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEvidence(ev.id)}
                    className="mt-0.5 accent-[#c99a4b]"
                  />
                  <span>{ev.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 9. Reconstruct the Crime Sequence */}
        <div className="leather-surface rounded-md p-5 space-y-3">
          <div>
            <h2 className="font-display text-base text-[#c99a4b]">
              9. Reconstruct the Crime (Arrange Chronologically)
            </h2>
            <p className="text-xs text-[#a89b88]">
              Order the critical crime beats from earliest action to final discovery.
            </p>
          </div>
          <ol className="space-y-2">
            {reconstructionOrder.map((id, idx) => {
              const ev = caseDef.timelineEvents.find((t) => t.id === id);
              if (!ev) return null;
              return (
                <li
                  key={id}
                  className="p-3 rounded bg-[#120f0d] border border-[#c99a4b]/25 flex items-center justify-between gap-3"
                >
                  <div className="text-sm text-[#f2eadc]">
                    <span className="font-mono-tabular text-[#c99a4b] mr-2">#{idx + 1}</span>
                    <span>{ev.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        setReconstructionOrder((prev) => reorderTimelineList(prev, idx, idx - 1))
                      }
                      aria-label={`Move ${ev.title} earlier in reconstruction`}
                      className="p-1.5 rounded bg-[#201915] text-[#cbbba0] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === reconstructionOrder.length - 1}
                      onClick={() =>
                        setReconstructionOrder((prev) => reorderTimelineList(prev, idx, idx + 1))
                      }
                      aria-label={`Move ${ev.title} later in reconstruction`}
                      className="p-1.5 rounded bg-[#201915] text-[#cbbba0] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-4 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-sm uppercase tracking-[0.15em] rounded shadow-xl transition-transform active:scale-[0.99] cursor-pointer"
          >
            Present Your Case
          </button>
        </div>
      </form>
    </section>
  );
};
