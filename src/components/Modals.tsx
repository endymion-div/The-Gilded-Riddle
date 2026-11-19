import React from 'react';
import { X } from 'lucide-react';
import {
  AccessibilitySettings,
  AudioSettings,
  CaseArchiveEntry,
} from '../types/game';

export const CaseArchiveModal: React.FC<{
  entries: CaseArchiveEntry[];
  onLaunchCase001: () => void;
  onClose: () => void;
}> = ({ entries, onLaunchCase001, onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Case Archive"
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
  >
    <div className="max-w-2xl w-full leather-surface rounded-md p-6 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#c99a4b]/25 pb-3">
        <h2 className="font-display text-xl text-[#c99a4b]">Scotland Yard Case Archive</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Case Archive"
          className="p-1.5 text-[#cbbba0] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded bg-[#120f0d] border border-[#c99a4b]/25 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="font-mono-tabular text-xs text-[#c99a4b]">
                {entry.code} · {entry.status === 'LOCKED_PREVIEW' ? 'FORTHCOMING' : entry.status}
              </div>
              <div className="font-display text-base text-[#f2eadc]">{entry.title}</div>
              <div className="text-xs text-[#a89b88]">{entry.subtitle}</div>
              {entry.bestEndingTitle && (
                <div className="text-xs text-[#8fd3ae]">Recorded Outcome: {entry.bestEndingTitle}</div>
              )}
            </div>
            {entry.id === 'case-001' ? (
              <button
                type="button"
                onClick={onLaunchCase001}
                className="px-4 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
              >
                Open Dossier
              </button>
            ) : (
              <span className="text-xs font-mono-tabular text-[#a89b88]">Sealed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="How to Play"
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
  >
    <div className="max-w-2xl w-full leather-surface rounded-md p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[#c99a4b]/25 pb-3">
        <h2 className="font-display text-xl text-[#c99a4b]">Detective Methodology</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close How to Play"
          className="p-1.5 text-[#cbbba0] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ol className="space-y-3 text-sm text-[#e7dcc7] leading-relaxed">
        <li>
          <strong className="text-[#c99a4b]">1. Observe Rooms Carefully:</strong> Toggle{' '}
          <em>Observe Mode</em> inside Ashcroft Manor rooms to spotlight subtle anomalies—slow
          clocks, folded carpets, scorched telegraph paper, and burned threads.
        </li>
        <li>
          <strong className="text-[#c99a4b]">2. Interrogate & Observe People:</strong> Ask initial
          questions, press weak claims, inspect suspects physically via <em>Observe Person</em>, and
          confront contradictions with hard exhibits.
        </li>
        <li>
          <strong className="text-[#c99a4b]">3. Connect Facts in the Mind Palace:</strong> Drag or
          select 2–3 clues together in the Synthesis Tray to verify logical conclusions and weed out
          red herrings.
        </li>
        <li>
          <strong className="text-[#c99a4b]">4. Reconstruct Timeline & Accuse:</strong> Align
          Westminster timestamps, resolve clock discrepancies, and present your complete deduction
          in the Deductions tab.
        </li>
      </ol>
    </div>
  </div>
);

export const SettingsModal: React.FC<{
  audio: AudioSettings;
  a11y: AccessibilitySettings;
  onUpdateAudio: (next: AudioSettings) => void;
  onTestAudio?: () => void;
  onUpdateA11y: (next: AccessibilitySettings) => void;
  onResetCase?: () => void;
  onClose: () => void;
}> = ({ audio, a11y, onUpdateAudio, onTestAudio, onUpdateA11y, onResetCase, onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Settings and Accessibility"
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
  >
    <div className="max-w-lg w-full leather-surface rounded-md p-6 space-y-5 shadow-2xl max-h-[88vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[#c99a4b]/25 pb-3">
        <h2 className="font-display text-xl text-[#c99a4b]">Audio & Accessibility</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Settings"
          className="p-1.5 text-[#cbbba0] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-wider text-[#a89b88]">Soundscape</div>
          {onTestAudio && (
            <button
              type="button"
              onClick={onTestAudio}
              className="px-3 py-1 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/45 text-xs text-[#c99a4b] font-display uppercase tracking-wider rounded whitespace-nowrap shrink-0 cursor-pointer"
            >
              Test Sound
            </button>
          )}
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <span>Dynamic Music</span>
          <input
            type="checkbox"
            checked={audio.musicEnabled}
            onChange={(e) => onUpdateAudio({ ...audio, musicEnabled: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span>Thunderstorm, Hearth & Clock Ambience</span>
          <input
            type="checkbox"
            checked={audio.ambienceEnabled}
            onChange={(e) => onUpdateAudio({ ...audio, ambienceEnabled: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span>Investigative Sound Effects</span>
          <input
            type="checkbox"
            checked={audio.effectsEnabled}
            onChange={(e) => onUpdateAudio({ ...audio, effectsEnabled: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#cbbba0]">
              <label htmlFor="vol-master">Master Volume</label>
              <span className="font-mono-tabular">{Math.round(audio.masterVolume * 100)}%</span>
            </div>
            <input
              id="vol-master"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.masterVolume}
              onChange={(e) => onUpdateAudio({ ...audio, masterVolume: Number(e.target.value) })}
              className="w-full accent-[#c99a4b]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#cbbba0]">
              <label htmlFor="vol-music">Music Volume</label>
              <span className="font-mono-tabular">{Math.round(audio.musicVolume * 100)}%</span>
            </div>
            <input
              id="vol-music"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.musicVolume}
              onChange={(e) => onUpdateAudio({ ...audio, musicVolume: Number(e.target.value) })}
              className="w-full accent-[#c99a4b]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#cbbba0]">
              <label htmlFor="vol-ambience">Ambience Volume</label>
              <span className="font-mono-tabular">{Math.round(audio.ambienceVolume * 100)}%</span>
            </div>
            <input
              id="vol-ambience"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.ambienceVolume}
              onChange={(e) => onUpdateAudio({ ...audio, ambienceVolume: Number(e.target.value) })}
              className="w-full accent-[#c99a4b]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#cbbba0]">
              <label htmlFor="vol-effects">Effects Volume</label>
              <span className="font-mono-tabular">{Math.round(audio.effectsVolume * 100)}%</span>
            </div>
            <input
              id="vol-effects"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.effectsVolume}
              onChange={(e) => onUpdateAudio({ ...audio, effectsVolume: Number(e.target.value) })}
              className="w-full accent-[#c99a4b]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm border-t border-[#c99a4b]/20 pt-4">
        <div className="text-xs uppercase tracking-wider text-[#a89b88]">Accessibility</div>
        <div className="flex items-center justify-between">
          <span>Text Size</span>
          <select
            value={a11y.textSize}
            onChange={(e) =>
              onUpdateA11y({
                ...a11y,
                textSize: e.target.value as AccessibilitySettings['textSize'],
              })
            }
            className="px-2.5 py-1.5 rounded bg-[#120f0d] border border-[#c99a4b]/30 text-xs text-[#f2eadc]"
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="large">Large</option>
          </select>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <span>Sound Subtitles</span>
          <input
            type="checkbox"
            checked={a11y.subtitlesEnabled}
            onChange={(e) => onUpdateA11y({ ...a11y, subtitlesEnabled: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span>Reduced Motion</span>
          <input
            type="checkbox"
            checked={a11y.reducedMotion}
            onChange={(e) => onUpdateA11y({ ...a11y, reducedMotion: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span>High Contrast Mode</span>
          <input
            type="checkbox"
            checked={a11y.highContrast}
            onChange={(e) => onUpdateA11y({ ...a11y, highContrast: e.target.checked })}
            className="accent-[#c99a4b]"
          />
        </label>
      </div>

      {onResetCase && (
        <div className="border-t border-[#c99a4b]/20 pt-4 flex justify-between items-center">
          <span className="text-xs text-[#a89b88]">Erase local progress and restart Case 001</span>
          <button
            type="button"
            onClick={onResetCase}
            className="px-3.5 py-2 bg-[#7a242c] hover:bg-[#922c36] text-xs text-[#f2eadc] font-display uppercase tracking-wider rounded cursor-pointer"
          >
            Reset Case
          </button>
        </div>
      )}
    </div>
  </div>
);

export const PauseModal: React.FC<{
  onResume: () => void;
  onSave: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
}> = ({ onResume, onSave, onRestart, onReturnToTitle }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Investigation Paused"
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
  >
    <div className="max-w-sm w-full leather-surface rounded-md p-6 space-y-5 text-center shadow-2xl">
      <div>
        <div className="font-mono-tabular text-xs uppercase tracking-[0.2em] text-[#c99a4b]">
          Ashcroft Manor
        </div>
        <h2 className="font-display text-2xl text-[#f2eadc] mt-1">Investigation Paused</h2>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onResume}
          className="w-full py-2.5 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
        >
          Resume Investigation
        </button>
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2.5 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/35 text-[#f2eadc] font-display text-xs uppercase tracking-wider rounded cursor-pointer"
        >
          Save Progress
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-2.5 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/35 text-[#f2eadc] font-display text-xs uppercase tracking-wider rounded cursor-pointer"
        >
          Restart Case
        </button>
        <button
          type="button"
          onClick={onReturnToTitle}
          className="w-full py-2.5 bg-transparent hover:bg-white/5 border border-white/15 text-[#cbbba0] font-display text-xs uppercase tracking-wider rounded cursor-pointer"
        >
          Return to Title
        </button>
      </div>
    </div>
  </div>
);
