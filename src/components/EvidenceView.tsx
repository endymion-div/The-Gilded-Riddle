import React, { useState } from 'react';
import {
  CaseDefinition,
  EvidenceCategory,
  EvidenceItem,
  InvestigationState,
  PlayerImportance,
} from '../types/game';

interface EvidenceViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onSetImportance: (evidenceId: string, importance: PlayerImportance) => void;
}

const CATEGORIES: ('ALL' | EvidenceCategory)[] = [
  'ALL',
  'PHYSICAL',
  'DOCUMENT',
  'FORENSIC',
  'TESTIMONY',
  'TELEGRAPH',
  'ENVIRONMENTAL',
  'TIMELINE',
  'BEHAVIORAL',
];

const IMPORTANCE_OPTIONS: { id: PlayerImportance; label: string }[] = [
  { id: 'UNMARKED', label: 'Unmarked' },
  { id: 'CRITICAL', label: 'Critical' },
  { id: 'SUPPORTING', label: 'Supporting' },
  { id: 'RED_HERRING', label: 'Distraction' },
];

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  caseDef,
  state,
  onSetImportance,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | EvidenceCategory>('ALL');
  const [selectedId, setSelectedId] = useState<string>(state.discoveredEvidenceIds[0] ?? '');

  const discovered = caseDef.evidence.filter((e) =>
    state.discoveredEvidenceIds.includes(e.id)
  );
  const filtered =
    filterCategory === 'ALL'
      ? discovered
      : discovered.filter((e) => e.category === filterCategory);

  const selected: EvidenceItem | undefined =
    filtered.find((e) => e.id === selectedId) ?? filtered[0];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5 animate-dossier-reveal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#f2eadc]">Evidence Ledger</h1>
          <p className="text-xs text-[#a89b88]">
            Judge reliability and assign importance yourself—do not assume every exhibit points to guilt.
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-[#c99a4b]">
          Discovered: {discovered.length} / {caseDef.evidence.length}
        </span>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#161210] border border-[#c99a4b]/25 rounded-md">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                : 'text-[#cbbba0] hover:text-[#f2eadc] hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Evidence List */}
        <div
          key={filterCategory}
          className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1 reveal-stagger"
        >
          {filtered.length === 0 ? (
            <div className="leather-surface rounded-md p-6 text-sm text-[#a89b88]">
              No exhibits catalogued in this category yet. Inspect rooms or press suspects.
            </div>
          ) : (
            filtered.map((ev) => {
              const active = selected?.id === ev.id;
              const playerTag = state.evidenceImportance[ev.id] ?? 'UNMARKED';
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedId(ev.id)}
                  className={`group evidence-card-hover w-full text-left p-4 rounded-md border cursor-pointer space-y-1.5 ${
                    active
                      ? 'bg-[#261d17] border-[#c99a4b] shadow-md'
                      : 'bg-[#161210] border-[#c99a4b]/20 hover:bg-[#1d1713]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm text-[#f2eadc] group-hover:text-[#e6be78] transition-colors">
                      {ev.name}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#c99a4b] shrink-0">
                      {ev.reliability}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#a89b88]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{ev.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{ev.whereFound}</span>
                      {playerTag !== 'UNMARKED' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#e7dcc7]">{playerTag}</span>
                        </>
                      )}
                    </div>
                    <span className="font-mono-tabular text-[11px] text-[#c99a4b] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0">
                      Inspect →
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detailed Forensic Exhibit Card */}
        <div className="lg:col-span-7">
          {selected ? (
            <div
              key={selected.id}
              className="parchment-surface rounded-md p-6 sm:p-8 border border-[#8c7350] shadow-xl space-y-5 animate-parchment-unfold"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3d2d20]/25 pb-3 text-xs font-mono-tabular uppercase text-[#5a4330]">
                <span>Exhibit · {selected.category}</span>
                <span>Reliability: {selected.reliability}</span>
              </div>

              <h2 className="font-display font-bold text-2xl text-[#1c140d]">
                {selected.name}
              </h2>

              <div className="flex flex-wrap gap-4 text-xs text-[#5a4330] font-mono-tabular">
                <span>Found: {selected.whereFound}</span>
                <span aria-hidden="true">·</span>
                <span>Logged: {selected.timeFound}</span>
              </div>

              <p className="text-base leading-relaxed text-[#241a12]">
                {selected.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#3d2d20]/20 text-sm">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#5a4330]">
                    Possible Interpretation
                  </div>
                  <p className="text-[#2a1f15] leading-relaxed">
                    {selected.possibleInterpretation}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#5a4330]">
                    Alternative Interpretation
                  </div>
                  <p className="text-[#2a1f15] leading-relaxed">
                    {selected.alternativeInterpretation}
                  </p>
                </div>
              </div>

              {/* Player Importance Classification */}
              <div className="pt-4 border-t border-[#3d2d20]/20 space-y-2">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#5a4330]">
                  Your Detective Assessment
                </div>
                <div className="flex flex-wrap gap-2">
                  {IMPORTANCE_OPTIONS.map((opt) => {
                    const current = state.evidenceImportance[selected.id] ?? 'UNMARKED';
                    const active = current === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSetImportance(selected.id, opt.id)}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#241a12] border-[#241a12] text-[#f2eadc] font-semibold'
                            : 'bg-white/40 border-[#3d2d20]/30 text-[#2a1f15] hover:bg-white/60'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="leather-surface rounded-md p-6 text-sm text-[#a89b88]">
              Select an exhibit from the ledger to review forensic details and competing interpretations.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
