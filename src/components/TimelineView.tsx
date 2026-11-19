import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { CaseDefinition, InvestigationState } from '../types/game';
import {
  getDiscoveredTimelineEvents,
  reorderTimelineList,
  validateTimelineOrder,
} from '../engine/timelineEngine';

interface TimelineViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onUpdateTimelineOrder: (nextOrder: string[]) => void;
  onVerifyTimelineSuccess: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  caseDef,
  state,
  onUpdateTimelineOrder,
  onVerifyTimelineSuccess,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const visibleEvents = getDiscoveredTimelineEvents(
    state.discoveredTimelineIds,
    state.playerTimelineOrder,
    caseDef
  );

  const orderedIds = visibleEvents.map((e) => e.id);

  const handleMove = (from: number, to: number) => {
    const next = reorderTimelineList(orderedIds, from, to);
    onUpdateTimelineOrder(next);
    setValidationMessage(null);
  };

  const handleValidate = () => {
    const res = validateTimelineOrder(orderedIds, caseDef);
    setValidationMessage({ ok: res.isExactChronologicalOrder, text: res.feedback });
    if (res.isExactChronologicalOrder) {
      onVerifyTimelineSuccess();
    }
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#f2eadc]">Timeline Reconstruction</h1>
          <p className="text-sm text-[#a89b88]">
            Drag events or use the arrow controls to reconstruct the true sequence of the evening.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono-tabular text-xs text-[#c99a4b]">
            Timestamps Logged: {visibleEvents.length} / {caseDef.timelineEvents.length}
          </span>
          <button
            type="button"
            onClick={handleValidate}
            className="px-4 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Test Chronology
          </button>
        </div>
      </div>

      {/* Clock Calibration Notice */}
      <div className="leather-surface rounded-md p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#cbbba0]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#c99a4b] shrink-0" />
          <span>
            Synchronized Reference: Inspector Harrow’s Westminster Chronometer (11:43 PM at
            discovery).
          </span>
        </div>
        <span className="font-mono-tabular text-[#c99a4b]">
          Study Mantel Clock Offset:{' '}
          {state.discoveredEvidenceIds.includes('ev-slow-clock')
            ? '-2 Minutes Slow'
            : 'Unverified'}
        </span>
      </div>

      {validationMessage && (
        <div
          className={`p-4 rounded border text-sm ${
            validationMessage.ok
              ? 'bg-[#17281f] border-[#4f9a71] text-[#bfe7cf]'
              : 'bg-[#2a1715] border-[#a85546] text-[#f2c4ba]'
          }`}
        >
          {validationMessage.text}
        </div>
      )}

      {/* Draggable Chronological Sequence */}
      <ol className="space-y-3">
        {visibleEvents.map((ev, index) => (
          <li
            key={ev.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                handleMove(dragIndex, index);
              }
              setDragIndex(null);
            }}
            className={`leather-surface rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
              dragIndex === index ? 'border-[#c99a4b] opacity-75' : 'hover:border-[#c99a4b]/55'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="px-3 py-1.5 rounded bg-[#120f0d] border border-[#c99a4b]/35 font-mono-tabular text-sm font-semibold text-[#c99a4b] shrink-0">
                {ev.displayTime}
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-base text-[#f2eadc]">{ev.title}</h2>
                <p className="text-sm text-[#cbbba0] leading-relaxed">{ev.description}</p>
                <div className="text-xs text-[#a89b88]">Source: {ev.source}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleMove(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${ev.title} earlier`}
                className="p-2 rounded bg-[#14100d] border border-[#c99a4b]/25 text-[#cbbba0] hover:text-[#f2eadc] disabled:opacity-30 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, index + 1)}
                disabled={index === visibleEvents.length - 1}
                aria-label={`Move ${ev.title} later`}
                className="p-2 rounded bg-[#14100d] border border-[#c99a4b]/25 text-[#cbbba0] hover:text-[#f2eadc] disabled:opacity-30 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
