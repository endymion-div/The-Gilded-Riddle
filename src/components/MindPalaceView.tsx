import React, { useState } from 'react';
import {
  Brain,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  CaseDefinition,
  DeductionRecipe,
  HypothesisTheory,
  InvestigationState,
  SuspectId,
} from '../types/game';
import { evaluateClueCombination } from '../engine/deductionEngine';

interface MindPalaceViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onUnlockDeduction: (recipe: DeductionRecipe) => void;
  onAddHypothesis: (theory: HypothesisTheory) => void;
  onUpdateHypothesisStatus: (id: string, status: HypothesisTheory['status']) => void;
  onDeleteHypothesis: (id: string) => void;
}

type PalaceTab =
  | 'connections'
  | 'observations'
  | 'evidence'
  | 'suspects'
  | 'timeline'
  | 'questions'
  | 'hypotheses'
  | 'contradictions';

const PALACE_TABS: { id: PalaceTab; label: string }[] = [
  { id: 'connections', label: 'Connections' },
  { id: 'observations', label: 'Observations' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'suspects', label: 'Suspects' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'questions', label: 'Questions' },
  { id: 'hypotheses', label: 'Hypotheses' },
  { id: 'contradictions', label: 'Contradictions' },
];

export const MindPalaceView: React.FC<MindPalaceViewProps> = ({
  caseDef,
  state,
  onUnlockDeduction,
  onAddHypothesis,
  onUpdateHypothesisStatus,
  onDeleteHypothesis,
}) => {
  const [activeTab, setActiveTab] = useState<PalaceTab>('connections');
  const [trayIds, setTrayIds] = useState<string[]>([]);
  const [synthesisMessage, setSynthesisMessage] = useState<{
    matched: boolean;
    text: string;
  } | null>(null);

  // Hypothesis composer state
  const [theoryTitle, setTheoryTitle] = useState('');
  const [theorySuspect, setTheorySuspect] = useState<SuspectId>('pembroke');
  const [theorySummary, setTheorySummary] = useState('');
  const [theoryWeakness, setTheoryWeakness] = useState('');

  const discoveredEvidence = caseDef.evidence.filter((e) =>
    state.discoveredEvidenceIds.includes(e.id)
  );
  const discoveredObservations = caseDef.observations.filter((o) =>
    state.discoveredObservationIds.includes(o.id)
  );
  const solvedDeductions = caseDef.deductionRecipes.filter((r) =>
    state.solvedDeductionIds.includes(r.id)
  );
  const discoveredContradictions = caseDef.contradictions.filter((c) =>
    state.discoveredContradictionIds.includes(c.id)
  );

  const toggleClueInTray = (id: string) => {
    setSynthesisMessage(null);
    setTrayIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-4)
    );
  };

  const handleSynthesize = () => {
    const res = evaluateClueCombination(
      trayIds,
      state.solvedDeductionIds,
      caseDef,
      state.difficulty
    );
    setSynthesisMessage({ matched: res.matched, text: res.feedback });
    if (res.matched && res.recipe) {
      onUnlockDeduction(res.recipe);
      setTrayIds([]);
    }
  };

  const handleCreateTheory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoryTitle.trim() || !theorySummary.trim()) return;
    onAddHypothesis({
      id: `hyp-${Date.now()}`,
      title: theoryTitle.trim(),
      suspectId: theorySuspect,
      summary: theorySummary.trim(),
      supportingClueIds: trayIds,
      weaknessNote: theoryWeakness.trim() || 'Requires further verification.',
      status: 'ACTIVE',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setTheoryTitle('');
    setTheorySummary('');
    setTheoryWeakness('');
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5 animate-dossier-reveal">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#c99a4b]" />
          <div>
            <h1 className="font-display text-2xl text-[#f2eadc]">The Mind Palace</h1>
            <p className="text-xs text-[#a89b88]">
              Organize observations, combine exhibits to test deductions, and refine competing theories.
            </p>
          </div>
        </div>
        <span className="font-mono-tabular text-xs text-[#c99a4b]">
          Synthesized Conclusions: {solvedDeductions.length} / {caseDef.deductionRecipes.length}
        </span>
      </div>

      {/* 8 Palace Section Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#161210] border border-[#c99a4b]/25 rounded-md">
        {PALACE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                : 'text-[#cbbba0] hover:text-[#f2eadc] hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONNECTIONS WORKBENCH (Combine Clues via Click or Drag) */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-parchment-unfold">
          {/* Available Clues Pool */}
          <div className="lg:col-span-6 leather-surface rounded-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base text-[#c99a4b]">
                Discovered Clues & Testimony
              </h2>
              <span className="text-xs text-[#a89b88]">Click or drag into the synthesis tray</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1 reveal-stagger">
              {discoveredEvidence.map((ev) => {
                const inTray = trayIds.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', ev.id)}
                    onClick={() => toggleClueInTray(ev.id)}
                    className={`evidence-card-hover text-left p-3 rounded border cursor-pointer space-y-1 ${
                      inTray
                        ? 'bg-[#2a2117] border-[#c99a4b] text-[#f2eadc]'
                        : 'bg-[#120f0d] border-white/10 text-[#cbbba0] hover:bg-[#191411]'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-snug">{ev.name}</div>
                    <div className="text-[11px] font-mono-tabular text-[#a89b88]">
                      {ev.category} · {ev.reliability}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Synthesis Tray & Verified Conclusions */}
          <div className="lg:col-span-6 space-y-5">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id && !trayIds.includes(id)) {
                  toggleClueInTray(id);
                }
              }}
              className="leather-surface rounded-md p-5 space-y-4 border-dashed border-[#c99a4b]/45"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#c99a4b]" />
                  <h2 className="font-display text-base text-[#f2eadc]">
                    Deduction Synthesis Tray ({trayIds.length})
                  </h2>
                </div>
                {trayIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTrayIds([]);
                      setSynthesisMessage(null);
                    }}
                    className="text-xs text-[#a89b88] hover:text-[#f2eadc] cursor-pointer"
                  >
                    Clear Tray
                  </button>
                )}
              </div>

              {trayIds.length === 0 ? (
                <p className="text-xs text-[#a89b88] py-4 text-center border border-white/10 rounded bg-[#120f0d]">
                  Select or drag 2–3 related facts here (for instance: Wet Umbrella + Dry Corridor +
                  Rain Log) to synthesize a formal deduction.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trayIds.map((id) => {
                    const ev = caseDef.evidence.find((item) => item.id === id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleClueInTray(id)}
                        className="px-3 py-1.5 rounded bg-[#241c15] border border-[#c99a4b] text-xs text-[#f2eadc] cursor-pointer"
                      >
                        {ev?.name ?? id} ×
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleSynthesize}
                disabled={trayIds.length < 2}
                className="w-full py-2.5 bg-[#c99a4b] hover:bg-[#d9ab5b] disabled:opacity-40 text-[#14100d] font-display font-bold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer"
              >
                Connect & Test Deduction
              </button>

              {synthesisMessage && (
                <div
                  className={`p-3 rounded border text-xs leading-relaxed ${
                    synthesisMessage.matched
                      ? 'bg-[#17281f] border-[#4f9a71] text-[#bfe7cf]'
                      : 'bg-[#2a1715] border-[#a85546] text-[#f2c4ba]'
                  }`}
                >
                  {synthesisMessage.text}
                </div>
              )}
            </div>

            {/* Verified Conclusions */}
            <div className="leather-surface rounded-md p-5 space-y-3">
              <h3 className="font-display text-base text-[#c99a4b]">
                Verified Logical Conclusions
              </h3>
              {solvedDeductions.length === 0 ? (
                <p className="text-xs text-[#a89b88]">
                  No deductions synthesized yet. Combine clues above to build irrefutable proof.
                </p>
              ) : (
                <ul className="space-y-3">
                  {solvedDeductions.map((ded) => (
                    <li
                      key={ded.id}
                      className="p-3.5 rounded bg-[#14100d] border border-[#4f9a71]/45 space-y-1 animate-ledger-item"
                    >
                      <div className="font-display text-sm text-[#8fd3ae]">{ded.title}</div>
                      <p className="text-xs text-[#f2eadc] leading-relaxed">
                        {ded.resultConclusion}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OBSERVATIONS TAB */}
      {activeTab === 'observations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 reveal-stagger">
          {discoveredObservations.length === 0 ? (
            <div className="leather-surface rounded-md p-6 text-sm text-[#a89b88]">
              No room observations recorded yet. Visit the Observe section to inspect Ashcroft Manor.
            </div>
          ) : (
            discoveredObservations.map((obs) => (
              <div key={obs.id} className="leather-surface evidence-card-hover rounded-md p-4 space-y-2">
                <div className="font-mono-tabular text-[11px] uppercase text-[#c99a4b]">
                  {obs.roomId}
                </div>
                <h2 className="font-display text-base text-[#f2eadc]">{obs.title}</h2>
                <p className="text-xs text-[#cbbba0] leading-relaxed">{obs.detail}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* EVIDENCE SUMMARY TAB */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 reveal-stagger">
          {discoveredEvidence.map((ev) => (
            <div key={ev.id} className="leather-surface evidence-card-hover rounded-md p-4 space-y-2">
              <div className="flex justify-between text-[11px] font-mono-tabular text-[#c99a4b]">
                <span>{ev.category}</span>
                <span>{ev.reliability}</span>
              </div>
              <h2 className="font-display text-base text-[#f2eadc]">{ev.name}</h2>
              <p className="text-xs text-[#cbbba0] leading-relaxed">{ev.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* SUSPECTS TAB */}
      {activeTab === 'suspects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 reveal-stagger">
          {caseDef.suspects.map((s) => {
            const st = state.suspectState[s.id];
            return (
              <div key={s.id} className="leather-surface rounded-md p-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-display text-base text-[#f2eadc]">{s.name}</h2>
                  <span className="font-mono-tabular text-xs text-[#c99a4b]">{st.alibiStatus}</span>
                </div>
                <p className="text-xs text-[#a89b88]">{s.publicMotive}</p>
                <p className="text-xs text-[#cbbba0] leading-relaxed">{s.alibi}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="leather-surface rounded-md p-5 space-y-3 animate-parchment-unfold reveal-stagger">
          {caseDef.timelineEvents
            .filter((t) => state.discoveredTimelineIds.includes(t.id))
            .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
            .map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row gap-3 pb-3 border-b border-white/10 last:border-0"
              >
                <span className="font-mono-tabular text-xs text-[#c99a4b] w-24 shrink-0">
                  {t.displayTime}
                </span>
                <div>
                  <div className="font-display text-sm text-[#f2eadc]">{t.title}</div>
                  <div className="text-xs text-[#cbbba0]">{t.description}</div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div className="leather-surface rounded-md p-5 space-y-3 animate-parchment-unfold">
          <h2 className="font-display text-lg text-[#c99a4b]">Open Investigative Questions</h2>
          <ul className="space-y-2.5 text-sm text-[#e7dcc7] reveal-stagger">
            <li>
              1. How was the inside brass thumb-bolt engaged when the Study door was locked from within?
              <span className="ml-2 font-mono-tabular text-xs text-[#c99a4b]">
                [{state.solvedDeductionIds.includes('ded-locked-room-trick') ? 'Answered' : 'Open'}]
              </span>
            </li>
            <li>
              2. Why does the Study Mantel Clock disagree with Inspector Harrow’s Westminster chronometer by 2 minutes?
              <span className="ml-2 font-mono-tabular text-xs text-[#c99a4b]">
                [{state.solvedDeductionIds.includes('ded-clock-offset-trap') ? 'Answered' : 'Open'}]
              </span>
            </li>
            <li>
              3. Did Sir Reginald collapse at 11:28 PM—or before the 11:26 PM lightning power surge?
              <span className="ml-2 font-mono-tabular text-xs text-[#c99a4b]">
                [{state.solvedDeductionIds.includes('ded-falsified-death-time') ? 'Answered' : 'Open'}]
              </span>
            </li>
            <li>
              4. Whom did Sir Reginald summon Inspector Harrow to arrest at midnight?
              <span className="ml-2 font-mono-tabular text-xs text-[#c99a4b]">
                [{state.solvedDeductionIds.includes('ded-medical-motive') ? 'Answered' : 'Open'}]
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* HYPOTHESES TAB */}
      {activeTab === 'hypotheses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-parchment-unfold">
          <form
            onSubmit={handleCreateTheory}
            className="lg:col-span-5 leather-surface rounded-md p-5 space-y-3"
          >
            <h2 className="font-display text-base text-[#c99a4b]">Draft Working Theory</h2>
            <div>
              <label className="block text-xs text-[#a89b88] mb-1">Theory Title</label>
              <input
                type="text"
                value={theoryTitle}
                onChange={(e) => setTheoryTitle(e.target.value)}
                placeholder="e.g., Theory B: The Catgut Bolt"
                className="w-full px-3 py-2 rounded bg-[#120f0d] border border-[#c99a4b]/30 text-sm text-[#f2eadc]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#a89b88] mb-1">Primary Suspect</label>
              <select
                value={theorySuspect}
                onChange={(e) => setTheorySuspect(e.target.value as SuspectId)}
                className="w-full px-3 py-2 rounded bg-[#120f0d] border border-[#c99a4b]/30 text-sm text-[#f2eadc]"
              >
                {caseDef.suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#a89b88] mb-1">Reasoning Summary</label>
              <textarea
                rows={3}
                value={theorySummary}
                onChange={(e) => setTheorySummary(e.target.value)}
                placeholder="Outline motive, means, and opportunity..."
                className="w-full px-3 py-2 rounded bg-[#120f0d] border border-[#c99a4b]/30 text-sm text-[#f2eadc]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#a89b88] mb-1">Known Weakness / Gap</label>
              <input
                type="text"
                value={theoryWeakness}
                onChange={(e) => setTheoryWeakness(e.target.value)}
                placeholder="What evidence is still missing or contradicts this?"
                className="w-full px-3 py-2 rounded bg-[#120f0d] border border-[#c99a4b]/30 text-sm text-[#f2eadc]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Theory</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {state.hypotheses.map((hyp) => {
              const suspect = caseDef.suspects.find((s) => s.id === hyp.suspectId);
              return (
                <div key={hyp.id} className="leather-surface rounded-md p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-base text-[#f2eadc]">{hyp.title}</h3>
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Status for ${hyp.title}`}
                        value={hyp.status}
                        onChange={(e) =>
                          onUpdateHypothesisStatus(
                            hyp.id,
                            e.target.value as HypothesisTheory['status']
                          )
                        }
                        className="px-2 py-1 text-xs rounded bg-[#120f0d] border border-[#c99a4b]/30 text-[#c99a4b]"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DISCARDED">Discarded</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => onDeleteHypothesis(hyp.id)}
                        aria-label={`Discard ${hyp.title}`}
                        className="p-1.5 text-[#a89b88] hover:text-[#e39b86] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-[#c99a4b]">Suspect: {suspect?.name}</div>
                  <p className="text-sm text-[#e7dcc7]">{hyp.summary}</p>
                  <p className="text-xs text-[#a89b88]">Weakness: {hyp.weaknessNote}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTRADICTIONS TAB */}
      {activeTab === 'contradictions' && (
        <div className="space-y-3 reveal-stagger">
          {discoveredContradictions.length === 0 ? (
            <div className="leather-surface rounded-md p-6 text-sm text-[#a89b88]">
              No contradictions formally exposed yet. Visit Suspects and present conflicting exhibits
              to shatter false alibis.
            </div>
          ) : (
            discoveredContradictions.map((con) => {
              const suspect = caseDef.suspects.find((s) => s.id === con.suspectId);
              return (
                <div key={con.id} className="leather-surface rounded-md p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base text-[#c99a4b]">{suspect?.name}</span>
                    <span className="font-mono-tabular text-xs text-[#e39b86]">
                      {con.alibiStatusLabel}
                    </span>
                  </div>
                  <p className="text-xs italic text-[#a89b88]">Claim: “{con.claimStatement}”</p>
                  <p className="text-sm text-[#f2eadc]">{con.deducedImplication}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
