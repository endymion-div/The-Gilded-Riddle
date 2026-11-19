import React from 'react';
import { DifficultyLevel } from '../types/game';

interface TitleScreenProps {
  hasSavedGame: boolean;
  difficulty: DifficultyLevel;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onBeginCase: () => void;
  onContinueCase: () => void;
  onOpenArchive: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

const DIFFICULTY_INFO: { id: DifficultyLevel; label: string; desc: string }[] = [
  {
    id: 'novice',
    label: 'Novice',
    desc: 'Subtle observational prompts & Mind Palace guidance',
  },
  {
    id: 'detective',
    label: 'Detective',
    desc: 'Balanced inquiry with limited hints',
  },
  {
    id: 'consulting',
    label: 'Consulting Detective',
    desc: 'No assistance — pure forensic & timeline reasoning',
  },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  difficulty,
  onSelectDifficulty,
  onBeginCase,
  onContinueCase,
  onOpenArchive,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0c0b0a] text-[#f2eadc] flex flex-col justify-between">
      {/* Cinematic London Key-Art Backdrop */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {!imgFailed ? (
          <img
            src="/src/assets/images/title_london_street_1794981133868.jpg"
            alt="Rain-swept Victorian London street outside Ashcroft Manor at night"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-center opacity-85"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_72%_42%,rgba(201,154,75,0.22),transparent_48%),linear-gradient(125deg,#0d0c0b_0%,#191410_60%,#0a0908_100%)]" />
        )}

        {/* Calm negative-space scrim on left third for high-contrast typography */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,10,9,0.92) 0%, rgba(11,10,9,0.74) 42%, rgba(11,10,9,0.22) 78%, rgba(11,10,9,0.55) 100%)',
          }}
        />

        {/* Animated Gaslight Glow, Rain Streaks, & Distant Lightning */}
        <div className="absolute right-[33%] top-[24%] h-40 w-40 rounded-full bg-[#e09f3e]/15 blur-3xl animate-candle" />
        <div className="absolute inset-0 bg-[#d8e3f0] pointer-events-none animate-thunder" />
        <svg
          className="absolute inset-0 h-full w-full opacity-25 animate-rain"
          aria-hidden="true"
        >
          <defs>
            <pattern id="victorian-rain" width="60" height="90" patternUnits="userSpaceOnUse">
              <line x1="12" y1="0" x2="6" y2="34" stroke="#cbd5e1" strokeWidth="0.7" />
              <line x1="44" y1="20" x2="38" y2="58" stroke="#cbd5e1" strokeWidth="0.6" />
              <line x1="28" y1="52" x2="23" y2="85" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#victorian-rain)" />
        </svg>
      </div>

      {/* Main Left-Third Editorial Lockup */}
      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-12 lg:px-20 py-10">
        <div className="max-w-xl w-full space-y-7">
          {/* Bespoke Inline SVG Title Emblem & Wordmark */}
          <div className="space-y-3">
            <svg
              viewBox="0 0 420 116"
              className="w-full max-w-[420px] h-auto"
              role="img"
              aria-label="The Gilded Riddle"
            >
              <g fill="none" stroke="#c99a4b" strokeWidth="1.2">
                <line x1="2" y1="14" x2="128" y2="14" strokeOpacity="0.6" />
                <circle cx="144" cy="14" r="6" />
                <path d="M144 8 V20 M138 14 H150" strokeWidth="0.9" />
                <line x1="160" y1="14" x2="286" y2="14" strokeOpacity="0.6" />
              </g>
              <text
                x="2"
                y="62"
                fill="#f2eadc"
                fontFamily="Cinzel, Georgia, serif"
                fontSize="38"
                fontWeight="700"
                letterSpacing="3"
              >
                THE GILDED
              </text>
              <text
                x="2"
                y="102"
                fill="#c99a4b"
                fontFamily="Cinzel, Georgia, serif"
                fontSize="40"
                fontWeight="600"
                letterSpacing="6"
              >
                RIDDLE
              </text>
            </svg>

            <p className="text-lg sm:text-xl italic text-[#d8ccb8] tracking-wide">
              “Observe everything. Assume nothing.”
            </p>
            <p className="text-sm text-[#a89b88] leading-relaxed max-w-md">
              Case 001 · Ashcroft Manor, London · 11:43 PM. Six individuals inside a locked estate,
              one body behind a bolted oak study door, and a storm concealing every step.
            </p>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <div className="text-xs tracking-[0.14em] uppercase text-[#a89b88]">
              Deduction Difficulty
            </div>
            <div className="inline-flex flex-wrap gap-1.5 p-1 bg-[#161210]/90 border border-[#c99a4b]/25 rounded-md">
              {DIFFICULTY_INFO.map((item) => {
                const active = difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDifficulty(item.id)}
                    className={`px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                        : 'text-[#d8ccb8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#a89b88]">
              {DIFFICULTY_INFO.find((d) => d.id === difficulty)?.desc}
            </p>
          </div>

          {/* Action Stack (Single Primary CTA + Secondary Controls) */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onBeginCase}
              className="px-7 py-3.5 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#130f0c] font-display font-bold text-sm tracking-[0.12em] uppercase rounded transition-transform active:scale-[0.99] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Begin Case
            </button>

            {hasSavedGame && (
              <button
                type="button"
                onClick={onContinueCase}
                className="px-5 py-3.5 bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/45 text-[#f2eadc] font-display text-sm tracking-[0.08em] uppercase rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Continue Investigation
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-sm text-[#cbbba0]">
            <button
              type="button"
              onClick={onOpenArchive}
              className="hover:text-[#c99a4b] underline underline-offset-4 decoration-[#c99a4b]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Case Archive
            </button>
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="hover:text-[#c99a4b] underline underline-offset-4 decoration-[#c99a4b]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Interactive Demo
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="hover:text-[#c99a4b] underline underline-offset-4 decoration-[#c99a4b]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Settings & Audio
            </button>
          </div>
        </div>

        {/* Diegetic Pavement Newspaper Broadsheet Prop on Desktop */}
        <aside
          aria-label="London Evening Gazette Broadsheet"
          className="hidden lg:block ml-auto max-w-xs parchment-surface p-5 rounded-sm shadow-2xl border border-[#8c7350] rotate-[1.4deg] self-end mb-6"
        >
          <div className="border-b border-[#3a2a1d]/40 pb-1.5 mb-2 flex justify-between text-[11px] font-mono-tabular uppercase tracking-wider text-[#4a3728]">
            <span>London Gazette</span>
            <span>Late Edition</span>
          </div>
          <h2 className="font-display font-bold text-lg leading-tight text-[#1a120b] mb-2">
            MYSTERY AT ASHCROFT MANOR
          </h2>
          <p className="text-xs leading-relaxed text-[#2f2318]">
            Industrialist Sir Reginald Ashcroft discovered lifeless behind a bolted study door at
            11:43 PM. Scotland Yard seeks an independent consulting detective immediately.
          </p>
        </aside>
      </div>

      {/* Single Flat Control-Hint Line in Bottom Safe Margin */}
      <footer className="relative z-10 px-6 sm:px-12 lg:px-20 pb-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#a89b88]">
        <span>Enter / Space Begin Case · Click Hotspots & Drag Clues · Esc / P Pause</span>
        <span className="font-mono-tabular">1894 · Belgravia, London</span>
      </footer>
    </main>
  );
};
