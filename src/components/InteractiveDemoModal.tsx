import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

interface InteractiveDemoModalProps {
  onClose: () => void;
  onStartRealCase?: () => void;
  isInGame?: boolean;
}

const DEMO_STEPS = [
  { id: 0, label: '1. Observe Mode' },
  { id: 1, label: '2. Interrogate' },
  { id: 2, label: '3. Mind Palace' },
  { id: 3, label: '4. Timeline & Verdict' },
];

export const InteractiveDemoModal: React.FC<InteractiveDemoModalProps> = ({
  onClose,
  onStartRealCase,
  isInGame = false,
}) => {
  const [step, setStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);

  // Step 1: Observe Mode simulation state
  const [demoObserveOn, setDemoObserveOn] = useState(false);
  const [foundClockClue, setFoundClockClue] = useState(false);

  // Step 2: Interrogation & Confrontation state
  const [witnessPressed, setWitnessPressed] = useState(false);
  const [witnessConfronted, setWitnessConfronted] = useState(false);

  // Step 3: Mind Palace clue synthesis state
  const [selectedDemoClues, setSelectedDemoClues] = useState<string[]>([]);
  const [demoDeductionSolved, setDemoDeductionSolved] = useState(false);

  // Step 4: Timeline verification state
  const [timelineEvents, setTimelineEvents] = useState<
    { id: string; time: string; title: string }[]
  >([
    { id: 't2', time: '11:26 PM', title: 'Storm lightning dims manor gaslights' },
    { id: 't1', time: '11:15 PM', title: 'Rainstorm begins over Belgravia' },
  ]);
  const [timelineVerified, setTimelineVerified] = useState(false);

  const resetDemo = () => {
    setAutoPlaying(false);
    setStep(0);
    setDemoObserveOn(false);
    setFoundClockClue(false);
    setWitnessPressed(false);
    setWitnessConfronted(false);
    setSelectedDemoClues([]);
    setDemoDeductionSolved(false);
    setTimelineEvents([
      { id: 't2', time: '11:26 PM', title: 'Storm lightning dims manor gaslights' },
      { id: 't1', time: '11:15 PM', title: 'Rainstorm begins over Belgravia' },
    ]);
    setTimelineVerified(false);
    soundEngine.playEffect('paper');
  };

  // Optional hands-free Auto-Play Walkthrough
  useEffect(() => {
    if (!autoPlaying) return;
    let tick = 0;

    const runPhase = () => {
      if (tick === 0) {
        setStep(0);
        setDemoObserveOn(true);
        soundEngine.playEffect('click');
      } else if (tick === 1) {
        setFoundClockClue(true);
        soundEngine.playEffect('evidence');
      } else if (tick === 2) {
        setStep(1);
        setWitnessPressed(true);
        soundEngine.playEffect('clue_sting');
      } else if (tick === 3) {
        setWitnessConfronted(true);
        soundEngine.playEffect('contradiction');
      } else if (tick === 4) {
        setStep(2);
        setSelectedDemoClues(['c1', 'c2']);
        soundEngine.playEffect('click');
      } else if (tick === 5) {
        setDemoDeductionSolved(true);
        soundEngine.playEffect('deduction_confirm');
      } else if (tick === 6) {
        setStep(3);
        setTimelineEvents([
          { id: 't1', time: '11:15 PM', title: 'Rainstorm begins over Belgravia' },
          { id: 't2', time: '11:26 PM', title: 'Storm lightning dims manor gaslights' },
        ]);
        soundEngine.playEffect('click');
      } else if (tick === 7) {
        setTimelineVerified(true);
        soundEngine.playEffect('case_solved');
        setAutoPlaying(false);
      }
      tick++;
    };

    runPhase();
    const id = window.setInterval(runPhase, 1900);
    return () => window.clearInterval(id);
  }, [autoPlaying]);

  const toggleDemoClue = (id: string) => {
    soundEngine.playEffect('click');
    setSelectedDemoClues((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSynthesizeDemo = () => {
    if (selectedDemoClues.includes('c1') && selectedDemoClues.includes('c2')) {
      setDemoDeductionSolved(true);
      soundEngine.playEffect('deduction_confirm');
    } else {
      soundEngine.playEffect('wrong');
    }
  };

  const handleSwapTimeline = () => {
    soundEngine.playEffect('click');
    setTimelineEvents((prev) => [prev[1], prev[0]]);
    setTimelineVerified(false);
  };

  const handleVerifyTimeline = () => {
    const ok = timelineEvents[0].id === 't1' && timelineEvents[1].id === 't2';
    if (ok) {
      setTimelineVerified(true);
      soundEngine.playEffect('case_solved');
    } else {
      soundEngine.playEffect('wrong');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive How to Play Demo"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4"
    >
      <div className="max-w-3xl w-full leather-surface rounded-md p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-parchment-unfold">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c99a4b]/25 pb-3">
          <div>
            <div className="font-mono-tabular text-[11px] uppercase tracking-[0.18em] text-[#c99a4b]">
              Interactive Tutorial · Practice Simulation (Spoiler-Free)
            </div>
            <h2 className="font-display text-xl text-[#f2eadc] mt-0.5">
              How to Play: Consulting Detective Demo
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void soundEngine.unlockAndStart();
                setAutoPlaying((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/45 text-xs text-[#c99a4b] font-display uppercase tracking-wider whitespace-nowrap shrink-0 cursor-pointer"
            >
              {autoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoPlaying ? 'Pause Auto-Demo' : 'Watch Auto-Demo'}</span>
            </button>

            <button
              type="button"
              onClick={resetDemo}
              aria-label="Reset Demo"
              title="Reset Demo"
              className="p-1.5 rounded bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/30 text-[#cbbba0] hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Interactive Demo"
              className="p-1.5 text-[#cbbba0] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#120f0d] border border-[#c99a4b]/25 rounded-md">
          {DEMO_STEPS.map((s) => {
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setAutoPlaying(false);
                  setStep(s.id);
                  soundEngine.playEffect('click');
                }}
                className={`px-2.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#c99a4b] text-[#14100d] font-semibold'
                    : 'text-[#cbbba0] hover:text-[#f2eadc] hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* STEP 1: OBSERVE MODE DEMO */}
        {step === 0 && (
          <div key="demo-step-0" className="space-y-4 animate-parchment-unfold">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#e7dcc7]">
                <strong className="text-[#c99a4b]">Goal:</strong> Activate{' '}
                <em>Observe Mode</em> to spot hidden anomalies in a room, then click the spotlighted
                detail to catalogue evidence.
              </p>
              <button
                type="button"
                onClick={() => {
                  void soundEngine.unlockAndStart();
                  setDemoObserveOn((v) => !v);
                  soundEngine.playEffect('click');
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded border text-xs font-display uppercase tracking-wider whitespace-nowrap shrink-0 cursor-pointer ${
                  demoObserveOn
                    ? 'bg-[#c99a4b] border-[#e0b66b] text-[#14100d] font-bold'
                    : 'bg-[#201915] border-[#c99a4b]/40 text-[#f2eadc]'
                }`}
              >
                {demoObserveOn ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{demoObserveOn ? 'Observe Mode Active' : 'Activate Observe Mode'}</span>
              </button>
            </div>

            <div className="relative rounded-md overflow-hidden border border-[#c99a4b]/35 bg-[#0d0c0b] h-52 sm:h-60">
              <img
                src="/src/assets/images/study_room_scene_1794981134515.jpg"
                alt="Practice Study Room Scene"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  demoObserveOn ? 'brightness-50 contrast-115' : 'brightness-90'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

              <button
                type="button"
                onClick={() => {
                  if (!demoObserveOn) return;
                  setFoundClockClue(true);
                  soundEngine.playEffect('evidence');
                }}
                disabled={!demoObserveOn}
                className={`absolute left-[18%] sm:left-[23%] top-[24%] px-3 py-1.5 rounded border text-xs font-display tracking-wider transition-all cursor-pointer ${
                  !demoObserveOn
                    ? 'opacity-35 bg-[#161210]/70 border-white/20 text-[#a89b88] cursor-not-allowed'
                    : foundClockClue
                      ? 'bg-[#1b3326] border-[#66b889] text-[#d9f5e6]'
                      : 'bg-[#241b13]/95 border-[#c99a4b] text-[#f2eadc] animate-observe-ring'
                }`}
              >
                {foundClockClue ? '✓ Mantel Clock Inspected' : 'Inspect Mantel Clock'}
              </button>

              <div className="absolute bottom-3 left-3 right-3 text-xs text-[#e7dcc7]">
                {foundClockClue ? (
                  <span className="text-[#8fd3ae]">
                    Exhibit Catalogued: The mantel clock lags behind real time—crucial for testing
                    suspect alibis!
                  </span>
                ) : demoObserveOn ? (
                  <span className="text-[#c99a4b]">
                    Observe Mode active! Click the highlighted Mantel Clock hotspot above.
                  </span>
                ) : (
                  <span>Click “Activate Observe Mode” first to reveal subtle room anomalies.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTERROGATION DEMO */}
        {step === 1 && (
          <div key="demo-step-1" className="space-y-4 animate-parchment-unfold">
            <p className="text-sm text-[#e7dcc7]">
              <strong className="text-[#c99a4b]">Goal:</strong> Never take an alibi at face value.{' '}
              <strong>Press</strong> evasive claims, then <strong>Confront</strong> with hard
              evidence to break lies.
            </p>

            <div className="p-4 rounded-md bg-[#120f0d] border border-[#c99a4b]/25 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <div className="font-display text-base text-[#f2eadc]">
                    Practice Witness · Butler Greaves
                  </div>
                  <div className="text-xs text-[#a89b88]">
                    Claim: “I heard the parlor bell at 11:24 PM and never entered the corridor.”
                  </div>
                </div>
                <span
                  className={`font-mono-tabular text-xs px-2.5 py-1 rounded border ${
                    witnessConfronted
                      ? 'bg-[#2a1715] border-[#a85546] text-[#f2c4ba]'
                      : witnessPressed
                        ? 'bg-[#2a2117] border-[#c99a4b] text-[#c99a4b]'
                        : 'bg-[#161210] border-white/15 text-[#a89b88]'
                  }`}
                >
                  Alibi: {witnessConfronted ? 'BROKEN' : witnessPressed ? 'QUESTIONABLE' : 'UNCHECKED'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWitnessPressed(true);
                    soundEngine.playEffect('clue_sting');
                  }}
                  className="px-3.5 py-2 rounded bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/40 text-xs text-[#f2eadc] font-display uppercase tracking-wider cursor-pointer"
                >
                  Press Claim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWitnessConfronted(true);
                    soundEngine.playEffect('contradiction');
                  }}
                  className="px-3.5 py-2 rounded bg-[#7a242c] hover:bg-[#922c36] text-xs text-[#f2eadc] font-display uppercase tracking-wider cursor-pointer"
                >
                  Present Clock Evidence
                </button>
              </div>

              <div className="text-xs leading-relaxed text-[#cbbba0] bg-[#171310] p-3 rounded border border-white/10">
                {witnessConfronted
                  ? '“Very well... the clock was two minutes slow! It was really 11:26 PM when I stepped out.” — Contradiction Exposed!'
                  : witnessPressed
                    ? 'Greaves shifts nervously: “I—I only glanced at the study clock on my way past...”'
                    : 'Use “Press Claim” to catch hesitation, then “Present Clock Evidence” to shatter the alibi.'}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MIND PALACE SYNTHESIS DEMO */}
        {step === 2 && (
          <div key="demo-step-2" className="space-y-4 animate-parchment-unfold">
            <p className="text-sm text-[#e7dcc7]">
              <strong className="text-[#c99a4b]">Goal:</strong> Inside the{' '}
              <strong>Mind Palace</strong>, select related clues together to verify logical
              conclusions and eliminate red herrings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'c1', title: 'Muddy Conservatory Boot', cat: 'Physical' },
                { id: 'c2', title: 'Rain Began at 11:15 PM', cat: 'Environmental' },
                { id: 'c3', title: 'Unpaid Tailor Receipt', cat: 'Distraction' },
              ].map((clue) => {
                const picked = selectedDemoClues.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => toggleDemoClue(clue.id)}
                    className={`evidence-card-hover text-left p-3 rounded border cursor-pointer space-y-1 ${
                      picked
                        ? 'bg-[#2a2117] border-[#c99a4b] text-[#f2eadc]'
                        : 'bg-[#120f0d] border-white/15 text-[#cbbba0]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{clue.title}</div>
                    <div className="text-[11px] font-mono-tabular text-[#a89b88]">{clue.cat}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSynthesizeDemo}
                disabled={selectedDemoClues.length < 2}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#c99a4b] hover:bg-[#d9ab5b] disabled:opacity-40 text-[#14100d] font-display font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>Synthesize Deduction</span>
              </button>

              <span className="text-xs text-[#a89b88]">
                Hint: Combine the muddy boot + rain timing (skip the receipt).
              </span>
            </div>

            {demoDeductionSolved ? (
              <div className="p-3 rounded bg-[#17281f] border border-[#4f9a71] text-xs text-[#bfe7cf] flex items-center gap-2 animate-ledger-item">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Deduction Verified: Someone stepped outside into the garden after 11:15 PM!
                </span>
              </div>
            ) : (
              selectedDemoClues.includes('c3') && (
                <div className="p-3 rounded bg-[#2a1715] border border-[#a85546] text-xs text-[#f2c4ba]">
                  Not every suspicious paper is murder proof—watch out for personal distractions.
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 4: TIMELINE & VERDICT DEMO */}
        {step === 3 && (
          <div key="demo-step-3" className="space-y-4 animate-parchment-unfold">
            <p className="text-sm text-[#e7dcc7]">
              <strong className="text-[#c99a4b]">Goal:</strong> Reconstruct the true sequence of
              events in <strong>Timeline</strong>, then present culprit, motive, and locked-room
              method in <strong>Deductions</strong> to earn one of 7 endings.
            </p>

            <div className="space-y-2">
              {timelineEvents.map((ev, idx) => (
                <div
                  key={ev.id}
                  className="p-3 rounded bg-[#120f0d] border border-[#c99a4b]/25 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tabular text-[#c99a4b]">{idx + 1}. {ev.time}</span>
                    <span className="text-[#f2eadc]">{ev.title}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSwapTimeline}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#201915] hover:bg-[#2c221c] border border-[#c99a4b]/40 text-xs text-[#f2eadc] cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#c99a4b]" />
                <span>Swap Event Order</span>
              </button>

              <button
                type="button"
                onClick={handleVerifyTimeline}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Verify Chronology</span>
              </button>
            </div>

            {timelineVerified && (
              <div className="p-3 rounded bg-[#17281f] border border-[#4f9a71] text-xs text-[#bfe7cf] flex items-center gap-2 animate-ledger-item">
                <Sparkles className="w-4 h-4 shrink-0 text-[#c99a4b]" />
                <span>
                  Chronology Confirmed! You’re ready to investigate Ashcroft Manor and expose the true culprit.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c99a4b]/20 pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAutoPlaying(false);
                setStep((s) => Math.max(0, s - 1));
                soundEngine.playEffect('click');
              }}
              disabled={step === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#201915] border border-[#c99a4b]/30 text-xs text-[#e7dcc7] disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAutoPlaying(false);
                setStep((s) => Math.min(DEMO_STEPS.length - 1, s + 1));
                soundEngine.playEffect('click');
              }}
              disabled={step === DEMO_STEPS.length - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#201915] border border-[#c99a4b]/30 text-xs text-[#e7dcc7] disabled:opacity-40 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isInGame && onStartRealCase ? (
            <button
              type="button"
              onClick={onStartRealCase}
              className="px-5 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
            >
              Start Real Case 001
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#c99a4b] hover:bg-[#d9ab5b] text-[#14100d] font-display font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
            >
              Return to Investigation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
