import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import {
  CaseDefinition,
  DifficultyLevel,
  ObservationItem,
  RoomId,
} from '../types/game';
import { getObservationHint } from '../engine/deductionEngine';

interface ObserveRoomViewProps {
  caseDef: CaseDefinition;
  activeRoomId: RoomId;
  onSelectRoom: (roomId: RoomId) => void;
  discoveredObservationIds: string[];
  difficulty: DifficultyLevel;
  onInspectObservation: (obs: ObservationItem) => void;
}

export const ObserveRoomView: React.FC<ObserveRoomViewProps> = ({
  caseDef,
  activeRoomId,
  onSelectRoom,
  discoveredObservationIds,
  difficulty,
  onInspectObservation,
}) => {
  const [observeMode, setObserveMode] = useState(false);
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const room = caseDef.rooms.find((r) => r.id === activeRoomId) ?? caseDef.rooms[0];
  const roomObservations = caseDef.observations.filter((o) => o.roomId === room.id);
  const discoveredInRoom = roomObservations.filter((o) =>
    discoveredObservationIds.includes(o.id)
  ).length;

  const selectedObs = selectedObsId
    ? caseDef.observations.find((o) => o.id === selectedObsId) ?? null
    : null;

  const handleClickHotspot = (obsId: string) => {
    const obs = caseDef.observations.find((o) => o.id === obsId);
    if (!obs) return;
    setSelectedObsId(obs.id);
    onInspectObservation(obs);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Room Selector & Observation Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#161210] border border-[#c99a4b]/25 rounded-md">
          {caseDef.rooms.map((r) => {
            const active = r.id === room.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onSelectRoom(r.id);
                  setSelectedObsId(null);
                }}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                    : 'text-[#cbbba0] hover:text-[#f2eadc] hover:bg-white/5'
                }`}
              >
                {r.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono-tabular text-[#cbbba0]">
            Room Observations: {discoveredInRoom}/{roomObservations.length}
          </span>

          <button
            type="button"
            onClick={() => setObserveMode((prev) => !prev)}
            aria-pressed={observeMode}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-display uppercase tracking-wider rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              observeMode
                ? 'bg-[#c99a4b] border-[#e0b66b] text-[#14100d] font-bold'
                : 'bg-[#201915] border-[#c99a4b]/40 text-[#f2eadc] hover:border-[#c99a4b]'
            }`}
          >
            {observeMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{observeMode ? 'Observe Mode Active' : 'Activate Observe Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Interactive Scene Viewport + Inspection Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 relative rounded-md overflow-hidden border border-[#c99a4b]/30 bg-[#0d0c0b] flex flex-col lg:min-h-[480px]">
          <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1">
            {!failedImages[room.id] ? (
              <img
                src={room.backdropImage}
                alt={`${room.name} — ${room.subtitle}`}
                referrerPolicy="no-referrer"
                onError={() => setFailedImages((p) => ({ ...p, [room.id]: true }))}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  observeMode ? 'brightness-[0.58] contrast-[1.12] saturate-[0.82]' : 'brightness-95'
                }`}
              />
            ) : (
              <div className="w-full h-full min-h-[240px] bg-[radial-gradient(circle_at_30%_30%,rgba(201,154,75,0.18),transparent_55%),linear-gradient(150deg,#1a1410_0%,#0d0c0b_100%)]" />
            )}

            {/* Subtle vignette for readability */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: observeMode
                  ? 'radial-gradient(circle at center, transparent 35%, rgba(6,5,4,0.68) 100%)'
                  : 'linear-gradient(to top, rgba(11,9,8,0.82) 0%, transparent 32%)',
              }}
            />

            {/* Interactive Hotspots */}
            {room.hotspots.map((hs) => {
              const isDiscovered = discoveredObservationIds.includes(hs.observationId);
              const isSelected = selectedObsId === hs.observationId;

              const subtleUnrevealed = hs.requiresObserveMode && !observeMode && !isDiscovered;

              return (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => handleClickHotspot(hs.observationId)}
                  aria-label={`Inspect ${hs.label}`}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer group ${
                    subtleUnrevealed ? 'opacity-35 hover:opacity-90' : 'opacity-100'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-[#c99a4b] border-[#f2eadc] text-[#14100d]'
                        : isDiscovered
                          ? 'bg-[#265947]/90 border-[#9bd6b4] text-[#f2eadc]'
                          : observeMode
                            ? 'bg-[#1a1410]/90 border-[#c99a4b] text-[#c99a4b] animate-observe-ring'
                            : 'bg-[#1a1410]/80 border-[#cbbba0]/60 text-[#f2eadc]'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <span
                    className={`pointer-events-none absolute top-full mt-1 px-2 py-0.5 rounded bg-[#120f0d]/95 border border-[#c99a4b]/35 text-[11px] text-[#f2eadc] whitespace-nowrap transition-opacity ${
                      observeMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {hs.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Room Caption (below image on mobile, overlaid on sm+) */}
          <div className="sm:absolute sm:bottom-0 sm:inset-x-0 p-3 sm:p-4 bg-[#120f0d] sm:bg-transparent border-t border-[#c99a4b]/20 sm:border-0 pointer-events-none flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-base sm:text-lg text-[#f2eadc]">{room.name}</h2>
              <p className="text-xs text-[#cbbba0]">{room.subtitle}</p>
            </div>
            <span className="text-[11px] sm:text-xs text-[#c99a4b] bg-[#120f0d]/85 px-2.5 py-1 rounded border border-[#c99a4b]/25">
              {observeMode
                ? 'Subtle anomalies highlighted — click markers to examine'
                : 'Toggle Observe Mode to uncover hidden physical details'}
            </span>
          </div>
        </div>

        {/* Right Inspection Panel */}
        <aside className="lg:col-span-4 leather-surface rounded-md p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-[#c99a4b]/20 pb-3">
              <div className="text-xs uppercase tracking-widest text-[#c99a4b]">
                Scene Examination
              </div>
              <p className="text-sm text-[#cbbba0] mt-1 leading-relaxed">
                {room.atmosphereNote}
              </p>
            </div>

            {selectedObs ? (
              <div className="parchment-surface rounded p-4 space-y-3 border border-[#8c7350]">
                <div className="text-xs font-mono-tabular uppercase tracking-wider text-[#664e39]">
                  Observation Recorded
                </div>
                <h3 className="font-display font-bold text-base text-[#1c140d]">
                  {selectedObs.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#2a1f15]">
                  {selectedObs.detail}
                </p>
                {(() => {
                  const hint = getObservationHint(difficulty, selectedObs.subtleHint);
                  return hint ? (
                    <div className="pt-2 border-t border-[#3d2d20]/20 text-xs italic text-[#4a3728]">
                      Detective Note: {hint}
                    </div>
                  ) : null;
                })()}
              </div>
            ) : (
              <div className="p-4 rounded bg-[#14100d] border border-[#c99a4b]/15 text-sm text-[#a89b88] leading-relaxed">
                Select any object inside the scene to examine it closely. Subtle details—clock lag,
                threshold fibers, and layered ink drops—stand out under Observe Mode.
              </div>
            )}
          </div>

          {/* Room Discovery Checklist */}
          <div className="space-y-2 pt-3 border-t border-[#c99a4b]/20">
            <div className="text-xs uppercase tracking-wider text-[#a89b88]">
              Catalogued in {room.name}
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {room.hotspots.map((hs) => {
                const found = discoveredObservationIds.includes(hs.observationId);
                return (
                  <li key={hs.id}>
                    <button
                      type="button"
                      onClick={() => handleClickHotspot(hs.observationId)}
                      className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        selectedObsId === hs.observationId
                          ? 'bg-[#c99a4b]/20 text-[#f2eadc] border border-[#c99a4b]/50'
                          : 'bg-[#14100d] text-[#cbbba0] hover:bg-[#201915]'
                      }`}
                    >
                      <span className="truncate">{found ? hs.label : `${hs.label} (Unexamined)`}</span>
                      <span className="font-mono-tabular shrink-0 text-[11px] text-[#c99a4b]">
                        {found ? 'Logged' : 'Inspect'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};
