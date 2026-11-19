import React from 'react';
import {
  Clock,
  HelpCircle,
  Pause,
  Save,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AudioSettings, HudSection, InvestigationState } from '../types/game';
import { formatCaseDuration } from '../engine/saveSystem';

interface GameHudProps {
  activeSection: HudSection;
  onSelectSection: (section: HudSection) => void;
  state: InvestigationState;
  elapsedSeconds: number;
  audioSettings: AudioSettings;
  onToggleMute: () => void;
  onSaveGame: () => void;
  onOpenDemo: () => void;
  onOpenSettings: () => void;
  onPause: () => void;
  saveFeedback: string | null;
  activeSubtitle: string | null;
}

const NAV_ITEMS: { id: HudSection; label: string }[] = [
  { id: 'case', label: 'Case' },
  { id: 'observe', label: 'Observe' },
  { id: 'suspects', label: 'Suspects' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'mind_palace', label: 'Mind Palace' },
  { id: 'map', label: 'Map' },
  { id: 'notebook', label: 'Notebook' },
  { id: 'deductions', label: 'Deductions' },
];

export const GameHud: React.FC<GameHudProps> = ({
  activeSection,
  onSelectSection,
  state,
  elapsedSeconds,
  audioSettings,
  onToggleMute,
  onSaveGame,
  onOpenDemo,
  onOpenSettings,
  onPause,
  saveFeedback,
  activeSubtitle,
}) => {
  const isMuted = !audioSettings.musicEnabled && !audioSettings.effectsEnabled && !audioSettings.ambienceEnabled;

  return (
    <header className="md:sticky md:top-0 z-30 bg-[#120f0d]/95 border-b border-[#c99a4b]/25 shadow-lg">
      {/* Top Notebook Dossier Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-b border-[#c99a4b]/15">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 min-w-0">
          <span className="font-display font-bold text-sm sm:text-lg tracking-[0.12em] text-[#f2eadc] whitespace-nowrap shrink-0">
            THE GILDED RIDDLE
          </span>
          <span aria-hidden="true" className="text-[#c99a4b]/50 hidden sm:inline">·</span>
          <span className="font-mono-tabular text-[11px] sm:text-xs text-[#c99a4b] whitespace-nowrap shrink-0">
            CASE 001 · ASHCROFT MANOR · 11:43 PM
          </span>
        </div>

        {/* Live Telemetry Counts, Case Timer & Utility Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs text-[#cbbba0] font-mono-tabular mr-1">
            <span>Evidence: {state.discoveredEvidenceIds.length}/24</span>
            <span aria-hidden="true">·</span>
            <span>Deductions: {state.solvedDeductionIds.length}/7</span>
            <span aria-hidden="true">·</span>
            <span>Contradictions: {state.discoveredContradictionIds.length}/5</span>
          </div>

          <div
            aria-label="Case Timer"
            title="Active Investigation Time"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1410] border border-[#c99a4b]/25 text-[11px] sm:text-xs font-mono-tabular text-[#c99a4b] whitespace-nowrap shrink-0"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatCaseDuration(elapsedSeconds)}</span>
          </div>

          {saveFeedback && (
            <span className="text-xs text-[#c99a4b] font-mono-tabular hidden sm:inline">
              {saveFeedback}
            </span>
          )}

          <button
            type="button"
            onClick={onOpenDemo}
            title="Interactive How-to-Play Demo"
            aria-label="Interactive How to Play Demo"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs text-[#e7dcc7] bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#c99a4b]" />
            <span className="hidden sm:inline">Demo</span>
          </button>

          <button
            type="button"
            onClick={onSaveGame}
            title="Save Investigation"
            aria-label="Save Investigation"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs text-[#e7dcc7] bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#c99a4b]" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 sm:p-2 text-[#e7dcc7] bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 rounded transition-colors shrink-0 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#a89b88]" /> : <Volume2 className="w-4 h-4 text-[#c99a4b]" />}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Audio & Accessibility Settings"
            aria-label="Settings"
            className="p-1.5 sm:p-2 text-[#e7dcc7] bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 rounded transition-colors shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#cbbba0]" />
          </button>

          <button
            type="button"
            onClick={onPause}
            title="Pause Game [P / Esc]"
            aria-label="Pause Investigation"
            className="p-1.5 sm:p-2 text-[#e7dcc7] bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 rounded transition-colors shrink-0 cursor-pointer"
          >
            <Pause className="w-4 h-4 text-[#cbbba0]" />
          </button>
        </div>
      </div>

      {/* Primary Investigation Navigation Tabs */}
      <nav
        aria-label="Detective Investigation Sections"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-display tracking-wider uppercase rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#c99a4b] text-[#14100d] font-bold shadow-sm'
                  : 'text-[#cbbba0] hover:text-[#f2eadc] hover:bg-[#201915]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {activeSubtitle && (
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {activeSubtitle}
        </div>
      )}
    </header>
  );
};
