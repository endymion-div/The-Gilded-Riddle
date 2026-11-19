import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { CaseDefinition, InvestigationState, RoomId } from '../types/game';
import { LocationSketch } from './LocationSketch';

interface MapViewProps {
  caseDef: CaseDefinition;
  state: InvestigationState;
  onTravelToRoom: (roomId: RoomId) => void;
}

export const MapView: React.FC<MapViewProps> = ({ caseDef, state, onTravelToRoom }) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(caseDef.mapLocations[0].id);

  const selected =
    caseDef.mapLocations.find((l) => l.id === selectedLocId) ?? caseDef.mapLocations[0];
  const selectedUnlocked = state.unlockedLocationIds.includes(selected.id);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#f2eadc]">Victorian London & Manor Survey</h1>
          <p className="text-sm text-[#a89b88]">
            Inspect distances between Ashcroft Manor wings and London leads unlocked through deduction.
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-[#c99a4b]">
          Locations Unlocked: {state.unlockedLocationIds.length} / {caseDef.mapLocations.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Parchment Architectural & City Map */}
        <div className="lg:col-span-8 parchment-surface rounded-md border border-[#8c7350] relative min-h-[420px] overflow-hidden p-4">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full min-h-[380px]"
            role="img"
            aria-label="Map of London and Ashcroft Manor grounds"
          >
            {/* Subtle Victorian Grid & River Thames */}
            <rect width="800" height="500" fill="none" stroke="#8c7350" strokeOpacity="0.25" />
            <path
              d="M0 395 Q 200 355 390 410 T 800 375 L 800 455 Q 580 420 380 460 T 0 440 Z"
              fill="#5a6f75"
              fillOpacity="0.32"
            />
            <text
              x="540"
              y="428"
              fill="#2f3f45"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="13"
              letterSpacing="4"
            >
              RIVER THAMES
            </text>

            {/* Ashcroft Manor Grounds Perimeter Box */}
            <rect
              x="120"
              y="120"
              width="310"
              height="240"
              rx="6"
              fill="#cbbba0"
              fillOpacity="0.35"
              stroke="#5a4330"
              strokeDasharray="6 4"
            />
            <text
              x="136"
              y="142"
              fill="#4a3728"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="12"
              fontWeight="700"
            >
              ASHCROFT MANOR ESTATE
            </text>

            {/* Walking Distance Survey Line: Study <-> Library (45 yds) & Study <-> Drawing Room (35 yds) */}
            <line x1="272" y1="170" x2="400" y2="190" stroke="#7a242c" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="315" y="166" fill="#7a242c" fontFamily="IBM Plex Mono, monospace" fontSize="11">
              45 yds
            </text>
            <line x1="272" y1="170" x2="176" y2="240" stroke="#7a242c" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="192" y="196" fill="#7a242c" fontFamily="IBM Plex Mono, monospace" fontSize="11">
              35 yds
            </text>
          </svg>

          {/* Interactive Location Pins */}
          {caseDef.mapLocations.map((loc) => {
            const unlocked = state.unlockedLocationIds.includes(loc.id);
            const active = selected.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocId(loc.id)}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  !unlocked
                    ? 'bg-[#2a221b]/85 border-[#5a4330] text-[#a89b88] opacity-65'
                    : active
                      ? 'bg-[#241a12] border-[#c99a4b] text-[#f2eadc] font-semibold scale-105'
                      : 'bg-[#efe4cf] border-[#5a4330] text-[#1c140d] hover:bg-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{loc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Location Details, Architectural Sketch & Quick Travel */}
        <aside
          key={selected.id}
          className="lg:col-span-4 leather-surface rounded-md p-6 flex flex-col justify-between space-y-5 animate-parchment-unfold"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-xs font-mono-tabular uppercase tracking-wider text-[#c99a4b]">
              <span>{selected.district}</span>
              <span className="text-[#a89b88]">Field Sketch</span>
            </div>

            <LocationSketch
              locationId={selected.id}
              locationName={selected.name}
              unlocked={selectedUnlocked}
            />

            <h2 className="font-display text-xl text-[#f2eadc]">{selected.name}</h2>
            <p className="text-sm text-[#cbbba0] leading-relaxed">{selected.description}</p>

            {typeof selected.walkMinutesFromStudy === 'number' && (
              <div className="p-3 rounded bg-[#120f0d] border border-[#c99a4b]/20 text-xs text-[#e7dcc7] font-mono-tabular">
                Walking Time from Study: ~{selected.walkMinutesFromStudy} min
              </div>
            )}

            {selected.leadClueText && (
              <div className="p-3 rounded bg-[#120f0d] border border-[#c99a4b]/20 text-xs text-[#cbbba0]">
                {selected.leadClueText}
              </div>
            )}
          </div>

          {selected.roomId && selectedUnlocked && (
            <button
              type="button"
              onClick={() => onTravelToRoom(selected.roomId!)}
              className="w-full py-2.5 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer"
            >
              Inspect This Scene
            </button>
          )}
        </aside>
      </div>
    </section>
  );
};
