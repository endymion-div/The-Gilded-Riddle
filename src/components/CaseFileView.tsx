import React, { useState } from 'react';
import { CaseDefinition, InvestigationState, SkillMetrics } from '../types/game';
import { computeOverallDetectiveRating, evaluateReasoningChallenge } from '../engine/deductionEngine';

interface CaseFileViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onCompleteChallenge: (challengeId: string, domain: keyof SkillMetrics) => void;
  onGoToObserve: () => void;
}

export const CaseFileView: React.FC<CaseFileViewProps> = ({
  caseDef,
  state,
  onCompleteChallenge,
  onGoToObserve,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [challengeFeedback, setChallengeFeedback] = useState<Record<string, { ok: boolean; text: string }>>({});

  const discoveredPoison = state.discoveredEvidenceIds.includes('ev-aconite-glass');
  const discoveredClock = state.discoveredEvidenceIds.includes('ev-slow-clock');
  const discoveredDoor = state.discoveredEvidenceIds.includes('ev-door-mechanism');
  const rating = computeOverallDetectiveRating(state.skills);

  const handleTestChallenge = (challengeId: string) => {
    const challenge = caseDef.reasoningChallenges.find((c) => c.id === challengeId);
    const chosen = selectedOptions[challengeId];
    if (!challenge || !chosen) return;
    const result = evaluateReasoningChallenge(challenge, chosen);
    setChallengeFeedback((prev) => ({
      ...prev,
      [challengeId]: { ok: result.correct, text: result.feedback },
    }));
    if (result.correct && !state.completedChallenges[challengeId]) {
      onCompleteChallenge(challengeId, result.skillDomain);
    }
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Case Dossier Header + Victim Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 parchment-surface rounded-md p-6 sm:p-8 shadow-xl border border-[#8c7350] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3d2d20]/25 pb-3 text-xs font-mono-tabular uppercase tracking-wider text-[#5a4330]">
              <span>Metropolitan Police · Special Inquiry Dossier</span>
              <span>File Ref: 1894-ASH-001</span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1c140d] tracking-wide">
              {caseDef.victim.name}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-sm border-y border-[#3d2d20]/20">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#664e39]">Age</div>
                <div className="font-semibold text-[#1c140d] tabular-nums">{caseDef.victim.age}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#664e39]">Occupation</div>
                <div className="font-semibold text-[#1c140d]">{caseDef.victim.occupation}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#664e39]">Location</div>
                <div className="font-semibold text-[#1c140d]">{caseDef.location}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#664e39]">Time Discovered</div>
                <div className="font-semibold text-[#1c140d] font-mono-tabular">{caseDef.discoveryTime}</div>
              </div>
            </div>

            <p className="text-base leading-relaxed text-[#2a1f15]">
              {caseDef.victim.briefingSummary}
            </p>

            <div className="pt-2 space-y-2 text-sm text-[#38291d]">
              <div>
                <span className="font-semibold">Estimated Window of Death: </span>
                <span>{caseDef.victim.estimatedDeathWindow}</span>
              </div>
              <div>
                <span className="font-semibold">Initial Forensic Finding: </span>
                <span>
                  {discoveredPoison
                    ? caseDef.victim.forensicSecretCause
                    : caseDef.victim.initialCause}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#3d2d20]/20 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs italic text-[#5a4330]">
              Forensic details expand automatically as physical evidence is uncovered.
            </span>
            <button
              type="button"
              onClick={onGoToObserve}
              className="px-5 py-2.5 bg-[#241a12] hover:bg-[#38291d] text-[#f2eadc] font-display text-xs uppercase tracking-widest rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Inspect Crime Scene
            </button>
          </div>
        </div>

        {/* Detective Profile & Forensic Progress */}
        <aside className="leather-surface rounded-md p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-[#c99a4b]/20 pb-3">
              <h2 className="font-display text-lg text-[#c99a4b] tracking-wider uppercase">
                Detective Standing
              </h2>
              <p className="text-sm text-[#d8ccb8] mt-1">
                {rating.title} · <span className="font-mono-tabular">{rating.average}</span>/100
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.entries(state.skills) as [keyof SkillMetrics, number][]).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs uppercase tracking-wider text-[#cbbba0]">
                    <span>{key}</span>
                    <span className="font-mono-tabular">{val}</span>
                  </div>
                  <div className="h-1.5 bg-[#2a211b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c99a4b] transition-all duration-300"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#c99a4b]/20 space-y-2 text-xs text-[#cbbba0]">
            <div className="uppercase tracking-wider text-[#a89b88]">Locked-Room Anomalies</div>
            <div className="flex justify-between">
              <span>Toxicology Analyzed</span>
              <span className="font-mono-tabular text-[#c99a4b]">
                {discoveredPoison ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Study Clock Calibrated</span>
              <span className="font-mono-tabular text-[#c99a4b]">
                {discoveredClock ? 'Verified (-2 min)' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Door Bolt Inspected</span>
              <span className="font-mono-tabular text-[#c99a4b]">
                {discoveredDoor ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Deduction Challenges (Applied Forensic & Spatial Reasoning) */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl text-[#f2eadc] tracking-wide">
            Analytical Reasoning Drills
          </h2>
          <p className="text-sm text-[#a89b88]">
            Test chronological arithmetic and manor wing walking times against hard physical facts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseDef.reasoningChallenges.map((chal) => {
            const completed = Boolean(state.completedChallenges[chal.id]);
            const fb = challengeFeedback[chal.id];
            return (
              <div
                key={chal.id}
                className="leather-surface rounded-md p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base text-[#c99a4b]">{chal.title}</h3>
                    {completed && (
                      <span className="text-xs font-mono-tabular text-[#7bc49d]">Solved</span>
                    )}
                  </div>
                  <p className="text-sm text-[#e7dcc7] leading-relaxed">{chal.prompt}</p>

                  <div className="space-y-2 pt-1">
                    {chal.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded border text-sm cursor-pointer transition-colors ${
                          selectedOptions[chal.id] === opt.id
                            ? 'bg-[#2c221b] border-[#c99a4b] text-[#f2eadc]'
                            : 'bg-[#14100d] border-[#c99a4b]/20 text-[#cbbba0] hover:border-[#c99a4b]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={chal.id}
                          value={opt.id}
                          checked={selectedOptions[chal.id] === opt.id}
                          onChange={() =>
                            setSelectedOptions((prev) => ({ ...prev, [chal.id]: opt.id }))
                          }
                          className="mt-1 accent-[#c99a4b]"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTestChallenge(chal.id)}
                    disabled={!selectedOptions[chal.id]}
                    className="px-4 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] disabled:opacity-45 text-[#14100d] font-display text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Verify Reasoning
                  </button>
                  {fb && (
                    <p
                      className={`text-xs leading-relaxed ${
                        fb.ok ? 'text-[#8fd3ae]' : 'text-[#e39b86]'
                      }`}
                    >
                      {fb.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
