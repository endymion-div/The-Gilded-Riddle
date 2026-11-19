import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { CaseDefinition, InvestigationState } from '../types/game';

interface NotebookViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onUpdateNote: (key: string, value: string) => void;
}

const NOTEBOOK_PAGES = [
  { id: 'summary', label: 'Case Summary' },
  { id: 'suspects', label: 'Suspect Notes' },
  { id: 'observations', label: 'Observations' },
  { id: 'questions', label: 'Important Questions' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'theories', label: 'Theories' },
  { id: 'deductions', label: 'Deductions' },
  { id: 'unsolved', label: 'Unsolved Clues' },
];

export const NotebookView: React.FC<NotebookViewProps> = ({
  caseDef,
  state,
  onUpdateNote,
}) => {
  const [activePage, setActivePage] = useState('summary');

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-[#c99a4b]" />
        <div>
          <h1 className="font-display text-2xl text-[#f2eadc]">Detective Field Notebook</h1>
          <p className="text-xs text-[#a89b88]">
            Bound leather journal — auto-records discoveries alongside your own handwritten notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Journal Index Tabs */}
        <aside className="lg:col-span-3 leather-surface rounded-md p-3 space-y-1">
          {NOTEBOOK_PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePage(p.id)}
              className={`w-full text-left px-3.5 py-2.5 text-sm rounded transition-colors cursor-pointer ${
                activePage === p.id
                  ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                  : 'text-[#cbbba0] hover:bg-white/5 hover:text-[#f2eadc]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </aside>

        {/* Parchment Journal Page */}
        <div className="lg:col-span-9 parchment-surface rounded-md p-6 sm:p-8 border border-[#8c7350] shadow-2xl space-y-5 min-h-[440px]">
          <div className="border-b border-[#3d2d20]/30 pb-2 flex justify-between items-center text-xs font-mono-tabular uppercase text-[#5a4330]">
            <span>{NOTEBOOK_PAGES.find((p) => p.id === activePage)?.label}</span>
            <span>Ashcroft Manor · Nov 1894</span>
          </div>

          {activePage === 'summary' && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-[#241a12]">
                {caseDef.victim.briefingSummary}
              </p>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5a4330]">
                Personal Field Memorandum
              </div>
              <textarea
                rows={5}
                value={state.notebookNotes.summary ?? ''}
                onChange={(e) => onUpdateNote('summary', e.target.value)}
                className="w-full p-3 rounded bg-white/45 border border-[#3d2d20]/30 text-sm text-[#1c140d]"
              />
            </div>
          )}

          {activePage === 'suspects' && (
            <div className="space-y-3">
              {caseDef.suspects.map((s) => (
                <div key={s.id} className="pb-3 border-b border-[#3d2d20]/15">
                  <div className="font-display font-bold text-sm text-[#1c140d]">
                    {s.name} ({s.occupation})
                  </div>
                  <div className="text-xs text-[#4a3728] mt-0.5">Alibi: {s.alibi}</div>
                  <div className="text-xs font-mono-tabular text-[#7a242c] mt-0.5">
                    Standing: {state.suspectState[s.id].alibiStatus}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePage === 'observations' && (
            <ul className="space-y-2.5 text-sm text-[#241a12]">
              {caseDef.observations
                .filter((o) => state.discoveredObservationIds.includes(o.id))
                .map((o) => (
                  <li key={o.id} className="pb-2 border-b border-[#3d2d20]/15">
                    <strong>{o.title}:</strong> {o.detail}
                  </li>
                ))}
              {state.discoveredObservationIds.length === 0 && (
                <li className="italic text-[#5a4330]">No observations recorded yet.</li>
              )}
            </ul>
          )}

          {activePage === 'questions' && (
            <div className="space-y-3">
              <p className="text-sm text-[#241a12]">
                Record unresolved contradictions and questions to press during interviews:
              </p>
              <textarea
                rows={6}
                value={state.notebookNotes.questions ?? ''}
                onChange={(e) => onUpdateNote('questions', e.target.value)}
                className="w-full p-3 rounded bg-white/45 border border-[#3d2d20]/30 text-sm text-[#1c140d]"
              />
            </div>
          )}

          {activePage === 'timeline' && (
            <div className="space-y-2 text-sm text-[#241a12]">
              {caseDef.timelineEvents
                .filter((t) => state.discoveredTimelineIds.includes(t.id))
                .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
                .map((t) => (
                  <div key={t.id} className="flex gap-3">
                    <span className="font-mono-tabular font-semibold w-20 shrink-0">
                      {t.displayTime}
                    </span>
                    <span>{t.title}</span>
                  </div>
                ))}
            </div>
          )}

          {activePage === 'theories' && (
            <div className="space-y-3">
              {state.hypotheses.map((h) => (
                <div key={h.id} className="p-3 rounded bg-white/40 border border-[#3d2d20]/20">
                  <div className="font-display font-bold text-sm">{h.title}</div>
                  <p className="text-xs mt-1">{h.summary}</p>
                </div>
              ))}
            </div>
          )}

          {activePage === 'deductions' && (
            <ul className="space-y-2.5 text-sm text-[#241a12]">
              {caseDef.deductionRecipes
                .filter((r) => state.solvedDeductionIds.includes(r.id))
                .map((r) => (
                  <li key={r.id} className="pb-2 border-b border-[#3d2d20]/15">
                    <strong>{r.title}:</strong> {r.resultConclusion}
                  </li>
                ))}
              {state.solvedDeductionIds.length === 0 && (
                <li className="italic text-[#5a4330]">
                  Synthesize clues inside the Mind Palace to record formal deductions here.
                </li>
              )}
            </ul>
          )}

          {activePage === 'unsolved' && (
            <div className="space-y-3">
              <p className="text-sm text-[#241a12]">
                Remaining physical leads yet to inspect:{' '}
                <span className="font-mono-tabular font-semibold">
                  {caseDef.observations.length - state.discoveredObservationIds.length}
                </span>{' '}
                room anomalies.
              </p>
              <textarea
                rows={5}
                value={state.notebookNotes.unsolved ?? ''}
                onChange={(e) => onUpdateNote('unsolved', e.target.value)}
                className="w-full p-3 rounded bg-white/45 border border-[#3d2d20]/30 text-sm text-[#1c140d]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
