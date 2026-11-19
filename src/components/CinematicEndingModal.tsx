import React, { useEffect, useState } from 'react';
import { CaseDefinition, EndingOutcome } from '../types/game';
import { formatCaseDuration } from '../engine/saveSystem';

interface CinematicEndingModalProps {
  caseDef: CaseDefinition;
  outcome: EndingOutcome;
  elapsedSeconds: number;
  onReplayCase: () => void;
  onReturnToTitle: () => void;
  onReviewInvestigation: () => void;
}

export const CinematicEndingModal: React.FC<CinematicEndingModalProps> = ({
  caseDef,
  outcome,
  elapsedSeconds,
  onReplayCase,
  onReturnToTitle,
  onReviewInvestigation,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [revealDone, setRevealDone] = useState(false);

  const beats = caseDef.reconstructionNarration;

  useEffect(() => {
    if (revealDone) return;
    if (stepIndex >= beats.length) {
      const t = window.setTimeout(() => setRevealDone(true), 600);
      return () => window.clearTimeout(t);
    }
    const timer = window.setTimeout(() => {
      setStepIndex((s) => s + 1);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [stepIndex, beats.length, revealDone]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Case Verdict and Reconstruction"
      className="fixed inset-0 z-50 bg-[#080706]/95 overflow-y-auto flex items-center justify-center p-4 sm:p-8"
    >
      <div className="max-w-3xl w-full leather-surface rounded-md p-6 sm:p-10 shadow-2xl space-y-6">
        {!revealDone ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="font-mono-tabular text-xs uppercase tracking-[0.2em] text-[#c99a4b]">
                Ashcroft Manor · Final Summation
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-[#f2eadc]">
                “Let us reconstruct the evening.”
              </h2>
            </div>

            <div className="space-y-3">
              {beats.slice(0, stepIndex).map((beat) => (
                <div
                  key={beat.time}
                  className="p-4 rounded bg-[#120f0d] border border-[#c99a4b]/30 flex flex-col sm:flex-row gap-3"
                >
                  <span className="font-mono-tabular text-sm font-semibold text-[#c99a4b] w-24 shrink-0">
                    {beat.time}
                  </span>
                  <div className="space-y-1">
                    <div className="font-display text-sm text-[#f2eadc]">{beat.title}</div>
                    <p className="text-xs text-[#cbbba0] leading-relaxed">{beat.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setRevealDone(true)}
                className="text-xs text-[#a89b88] hover:text-[#c99a4b] underline underline-offset-4 cursor-pointer"
              >
                Reveal Verdict Now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-[#c99a4b]/30 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-tabular text-xs uppercase tracking-[0.2em] text-[#c99a4b]">
                  Case Closed · {outcome.rankLabel}
                </div>
                <h2 className="font-display text-3xl text-[#f2eadc] mt-1">{outcome.title}</h2>
                <p className="text-sm text-[#cbbba0] mt-1">{outcome.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-[#a89b88]">
                  Deduction Score
                </div>
                <div className="font-mono-tabular text-3xl font-bold text-[#c99a4b]">
                  {outcome.score}/100
                </div>
                <div className="font-mono-tabular text-xs text-[#a89b88] mt-1">
                  Investigation Time: {formatCaseDuration(elapsedSeconds)}
                </div>
              </div>
            </div>

            <p className="text-base text-[#f2eadc] leading-relaxed">{outcome.verdictSummary}</p>

            <div className="p-4 rounded bg-[#120f0d] border border-[#c99a4b]/25 space-y-2">
              <div className="text-xs uppercase tracking-wider text-[#c99a4b]">
                Logical Breakdown
              </div>
              <ul className="space-y-1.5 text-sm text-[#cbbba0]">
                {outcome.logicalBreakdown.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onReviewInvestigation}
                className="px-4 py-2.5 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/35 text-xs font-display uppercase tracking-wider text-[#f2eadc] rounded cursor-pointer"
              >
                Review Case File
              </button>
              <button
                type="button"
                onClick={onReturnToTitle}
                className="px-4 py-2.5 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/35 text-xs font-display uppercase tracking-wider text-[#f2eadc] rounded cursor-pointer"
              >
                Title Screen
              </button>
              <button
                type="button"
                data-start="true"
                onClick={onReplayCase}
                className="px-5 py-2.5 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] text-xs font-display font-bold uppercase tracking-wider rounded cursor-pointer"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
