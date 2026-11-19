/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CASE_001, CASE_ARCHIVE_LIST } from './data/case001';
import {
  AccessibilitySettings,
  AccusationSubmission,
  AudioSettings,
  CaseArchiveEntry,
  DeductionRecipe,
  DialogueTopic,
  DifficultyLevel,
  EndingOutcome,
  GameMode,
  HudSection,
  HypothesisTheory,
  InvestigationState,
  ObservationItem,
  PlayerImportance,
  RoomId,
  SkillMetrics,
  SuspectId,
} from './types/game';
import {
  clearSavedInvestigation,
  createInitialInvestigationState,
  loadA11ySettings,
  loadArchiveProgress,
  loadAudioSettings,
  loadInvestigation,
  markCaseSolvedInArchive,
  saveA11ySettings,
  saveAudioSettings,
  saveInvestigation,
} from './engine/saveSystem';
import { soundEngine } from './engine/soundEngine';
import { applySkillGain } from './engine/deductionEngine';
import { evaluateContradictionConfrontation } from './engine/contradictionEngine';
import {
  executeTopicAsk,
  executeTopicChallenge,
  executeTopicPress,
} from './engine/interrogationEngine';
import { evaluateFinalEnding } from './engine/endingEngine';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { CaseFileView } from './components/CaseFileView';
import { ObserveRoomView } from './components/ObserveRoomView';
import { SuspectsView } from './components/SuspectsView';
import { EvidenceView } from './components/EvidenceView';
import { TimelineView } from './components/TimelineView';
import { MindPalaceView } from './components/MindPalaceView';
import { MapView } from './components/MapView';
import { NotebookView } from './components/NotebookView';
import { FinalDeductionView } from './components/FinalDeductionView';
import { CinematicEndingModal } from './components/CinematicEndingModal';
import { InteractiveDemoModal } from './components/InteractiveDemoModal';
import {
  CaseArchiveModal,
  PauseModal,
  SettingsModal,
} from './components/Modals';

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState<InvestigationState | null>(() =>
    loadInvestigation()
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('detective');
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const [state, setState] = useState<InvestigationState>(() =>
    createInitialInvestigationState(CASE_001, 'detective')
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const elapsedSecondsRef = useRef<number>(0);
  const [activeSection, setActiveSection] = useState<HudSection>('case');
  const [activeRoomId, setActiveRoomId] = useState<RoomId>('study');
  const [selectedSuspectId, setSelectedSuspectId] = useState<SuspectId>('evelyn');

  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(() =>
    loadA11ySettings()
  );
  const [archiveEntries, setArchiveEntries] = useState<CaseArchiveEntry[]>(() =>
    loadArchiveProgress(CASE_ARCHIVE_LIST)
  );

  const [showArchive, setShowArchive] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [endingOutcome, setEndingOutcome] = useState<EndingOutcome | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [discoveryToast, setDiscoveryToast] = useState<string | null>(null);

  // Sync body[data-state] for game shell state machine
  useEffect(() => {
    document.body.dataset.state = gameMode;
  }, [gameMode]);

  // Live Case Timer: ticks once per second while actively investigating
  useEffect(() => {
    if (gameMode !== 'playing') return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedSecondsRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameMode]);

  // Sync accessibility attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = a11ySettings.textSize;
    root.dataset.reducedMotion = a11ySettings.reducedMotion ? 'true' : 'false';
    root.dataset.contrast = a11ySettings.highContrast ? 'high' : 'standard';
    saveA11ySettings(a11ySettings);
  }, [a11ySettings]);

  // Sync sound engine settings & subtitles
  useEffect(() => {
    soundEngine.updateSettings(audioSettings);
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  // Unlock Web Audio cleanly on first pointer or keyboard gesture anywhere (including ?autostart=1)
  useEffect(() => {
    let unlocked = false;
    const handleFirstGesture = () => {
      void soundEngine.unlockAndStart().then((running) => {
        if (running) {
          unlocked = true;
          window.removeEventListener('pointerdown', handleFirstGesture, true);
          window.removeEventListener('keydown', handleFirstGesture, true);
        }
      });
    };
    window.addEventListener('pointerdown', handleFirstGesture, true);
    window.addEventListener('keydown', handleFirstGesture, true);
    return () => {
      if (!unlocked) {
        window.removeEventListener('pointerdown', handleFirstGesture, true);
        window.removeEventListener('keydown', handleFirstGesture, true);
      }
    };
  }, []);

  useEffect(() => {
    soundEngine.setPaused(gameMode === 'paused');
  }, [gameMode]);

  useEffect(() => {
    if (!a11ySettings.subtitlesEnabled) {
      soundEngine.setSubtitleListener(null);
      setActiveSubtitle(null);
      return;
    }
    let timer: number | undefined;
    soundEngine.setSubtitleListener((caption) => {
      setActiveSubtitle(caption);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setActiveSubtitle(null), 2600);
    });
    return () => {
      soundEngine.setSubtitleListener(null);
      if (timer) window.clearTimeout(timer);
    };
  }, [a11ySettings.subtitlesEnabled]);

  // Dynamic Music Tension State
  useEffect(() => {
    if (gameMode === 'gameover' && endingOutcome) {
      if (
        endingOutcome.id === 'MASTER_DETECTIVE' ||
        endingOutcome.id === 'HIDDEN_TRUTH' ||
        endingOutcome.id === 'BRILLIANT_DETECTIVE'
      ) {
        soundEngine.setTensionState('CASE_SOLVED');
      } else {
        soundEngine.setTensionState('DANGER');
      }
      return;
    }
    if (gameMode !== 'playing') {
      soundEngine.setTensionState('NORMAL');
      return;
    }
    if (activeSection === 'deductions') {
      soundEngine.setTensionState('FINAL_DEDUCTION');
    } else if (state.discoveredContradictionIds.length >= 2) {
      soundEngine.setTensionState('DANGER');
    } else if (state.solvedDeductionIds.length >= 2) {
      soundEngine.setTensionState('SUSPICION');
    } else if (state.discoveredEvidenceIds.length >= 7) {
      soundEngine.setTensionState('DISCOVERY');
    } else {
      soundEngine.setTensionState('INVESTIGATION');
    }
  }, [
    gameMode,
    activeSection,
    endingOutcome,
    state.discoveredContradictionIds.length,
    state.solvedDeductionIds.length,
    state.discoveredEvidenceIds.length,
  ]);

  const showToast = useCallback((text: string) => {
    setDiscoveryToast(text);
    window.setTimeout(() => {
      setDiscoveryToast((curr) => (curr === text ? null : curr));
    }, 3200);
  }, []);

  const persistState = useCallback((next: InvestigationState) => {
    const withTime: InvestigationState = {
      ...next,
      elapsedSeconds: elapsedSecondsRef.current,
    };
    const res = saveInvestigation(withTime);
    if (res.ok) {
      setSavedSnapshot(withTime);
    }
    return res;
  }, []);

  const handleBeginCase = useCallback(() => {
    soundEngine.unlockAndStart();
    soundEngine.playEffect('door_creak');
    const fresh = createInitialInvestigationState(CASE_001, difficulty);
    elapsedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setState(fresh);
    persistState(fresh);
    setEndingOutcome(null);
    setActiveSection('case');
    setActiveRoomId('study');
    setShowArchive(false);
    setShowHowToPlay(false);
    setShowSettings(false);
    setGameMode('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [difficulty, persistState]);

  const handleContinueCase = useCallback(() => {
    if (!savedSnapshot) return;
    soundEngine.unlockAndStart();
    soundEngine.playEffect('case_file');
    const restoredSeconds = savedSnapshot.elapsedSeconds ?? 0;
    elapsedSecondsRef.current = restoredSeconds;
    setElapsedSeconds(restoredSeconds);
    setState(savedSnapshot);
    setEndingOutcome(null);
    setActiveSection('case');
    setGameMode('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [savedSnapshot]);

  const handleManualSave = useCallback(() => {
    soundEngine.playEffect('paper');
    const res = persistState(state);
    setSaveFeedback(res.ok ? `Saved ${res.savedAt}` : 'Saved in session');
    window.setTimeout(() => setSaveFeedback(null), 2600);
  }, [persistState, state]);

  const handleToggleMute = useCallback(() => {
    setAudioSettings((prev) => {
      const currentlyMuted =
        !prev.musicEnabled && !prev.effectsEnabled && !prev.ambienceEnabled;
      const next = {
        ...prev,
        musicEnabled: currentlyMuted,
        effectsEnabled: currentlyMuted,
        ambienceEnabled: currentlyMuted,
      };
      if (currentlyMuted) {
        void soundEngine.unlockAndStart().then(() => {
          soundEngine.playEffect('click');
        });
      }
      return next;
    });
  }, []);

  // Global keyboard shortcuts (Enter/Space on title, Esc/P pause, M mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');
      if (isTyping) return;

      if (gameMode === 'title') {
        if (!showArchive && !showHowToPlay && !showSettings && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleBeginCase();
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (showSettings) {
          setShowSettings(false);
        } else if (gameMode === 'playing') {
          setGameMode('paused');
        } else if (gameMode === 'paused') {
          setGameMode('playing');
        }
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameMode,
    showArchive,
    showHowToPlay,
    showSettings,
    handleBeginCase,
    handleToggleMute,
  ]);

  const handleSelectSection = (section: HudSection) => {
    soundEngine.unlockAndStart();
    if (section === 'notebook' || section === 'case') {
      soundEngine.playEffect('paper');
    } else if (section === 'observe') {
      soundEngine.playEffect('footstep_wood');
    } else {
      soundEngine.playEffect('click');
    }
    setActiveSection(section);
  };

  // Room Observation Handler
  const handleInspectObservation = (obs: ObservationItem) => {
    soundEngine.unlockAndStart();
    setState((prev) => {
      const isNewObs = !prev.discoveredObservationIds.includes(obs.id);
      const nextObs = isNewObs
        ? [...prev.discoveredObservationIds, obs.id]
        : prev.discoveredObservationIds;

      let nextEvidence = prev.discoveredEvidenceIds;
      let isNewEv = false;
      if (obs.linkedEvidenceId && !prev.discoveredEvidenceIds.includes(obs.linkedEvidenceId)) {
        nextEvidence = [...prev.discoveredEvidenceIds, obs.linkedEvidenceId];
        isNewEv = true;
      }

      let nextTimeline = prev.discoveredTimelineIds;
      let nextOrder = prev.playerTimelineOrder;
      if (obs.linkedTimelineId && !prev.discoveredTimelineIds.includes(obs.linkedTimelineId)) {
        nextTimeline = [...prev.discoveredTimelineIds, obs.linkedTimelineId];
        nextOrder = [...prev.playerTimelineOrder, obs.linkedTimelineId];
      }

      if (isNewEv) {
        soundEngine.playEffect('evidence');
        const evName =
          CASE_001.evidence.find((e) => e.id === obs.linkedEvidenceId)?.name ?? obs.title;
        showToast(`Exhibit Catalogued: ${evName}`);
      } else if (isNewObs) {
        soundEngine.playEffect('clue_sting');
        showToast(`Observation Logged: ${obs.title}`);
      } else {
        soundEngine.playEffect('click');
      }

      const next: InvestigationState = {
        ...prev,
        discoveredObservationIds: nextObs,
        discoveredEvidenceIds: nextEvidence,
        discoveredTimelineIds: nextTimeline,
        playerTimelineOrder: nextOrder,
        skills: isNewObs
          ? applySkillGain(
              applySkillGain(prev.skills, 'observation', 5),
              obs.linkedEvidenceId?.includes('aconite') ||
                obs.linkedEvidenceId?.includes('watch')
                ? 'forensics'
                : 'observation',
              2
            )
          : prev.skills,
      };
      persistState(next);
      return next;
    });
  };

  // Interrogation Handlers
  const applyInterrogationOutput = (
    suspectId: SuspectId,
    questionText: string,
    topicId: string,
    mode: 'ask' | 'press' | 'challenge',
    output: ReturnType<typeof executeTopicAsk>
  ) => {
    setState((prev) => {
      const currSuspect = prev.suspectState[suspectId];
      let nextEv = prev.discoveredEvidenceIds;
      if (output.unlockedEvidenceId && !nextEv.includes(output.unlockedEvidenceId)) {
        nextEv = [...nextEv, output.unlockedEvidenceId];
        soundEngine.playEffect('evidence');
        const evName =
          CASE_001.evidence.find((e) => e.id === output.unlockedEvidenceId)?.name ??
          'New Testimony';
        showToast(`Testimony Logged: ${evName}`);
      } else if (output.unlockedContradictionId) {
        soundEngine.playEffect('contradiction');
        showToast('Contradiction Exposed!');
      } else {
        soundEngine.playEffect('click');
      }

      let nextTl = prev.discoveredTimelineIds;
      let nextOrder = prev.playerTimelineOrder;
      if (output.unlockedTimelineId && !nextTl.includes(output.unlockedTimelineId)) {
        nextTl = [...nextTl, output.unlockedTimelineId];
        nextOrder = [...nextOrder, output.unlockedTimelineId];
      }

      let nextCons = prev.discoveredContradictionIds;
      if (output.unlockedContradictionId && !nextCons.includes(output.unlockedContradictionId)) {
        nextCons = [...nextCons, output.unlockedContradictionId];
      }

      const next: InvestigationState = {
        ...prev,
        discoveredEvidenceIds: nextEv,
        discoveredTimelineIds: nextTl,
        playerTimelineOrder: nextOrder,
        discoveredContradictionIds: nextCons,
        skills: applySkillGain(prev.skills, 'interrogation', mode === 'challenge' ? 7 : 3),
        suspectState: {
          ...prev.suspectState,
          [suspectId]: {
            ...currSuspect,
            suspicion: Math.max(0, Math.min(100, currSuspect.suspicion + output.suspicionDelta)),
            trust: Math.max(0, Math.min(100, currSuspect.trust + output.trustDelta)),
            bodyLanguage: output.bodyLanguage,
            askedTopicIds:
              mode === 'ask' && !currSuspect.askedTopicIds.includes(topicId)
                ? [...currSuspect.askedTopicIds, topicId]
                : currSuspect.askedTopicIds,
            pressedTopicIds:
              mode === 'press' && !currSuspect.pressedTopicIds.includes(topicId)
                ? [...currSuspect.pressedTopicIds, topicId]
                : currSuspect.pressedTopicIds,
            challengedTopicIds:
              mode === 'challenge' && !currSuspect.challengedTopicIds.includes(topicId)
                ? [...currSuspect.challengedTopicIds, topicId]
                : currSuspect.challengedTopicIds,
            alibiStatus: output.newAlibiStatus ?? currSuspect.alibiStatus,
            dialogueLog: [
              ...currSuspect.dialogueLog,
              { speaker: 'Detective', text: questionText },
              {
                speaker: output.speaker,
                text: output.responseText,
                cue: output.bodyLanguage,
              },
            ],
          },
        },
      };
      persistState(next);
      return next;
    });
  };

  const handleAskTopic = (suspectId: SuspectId, topic: DialogueTopic) => {
    const out = executeTopicAsk(suspectId, topic, CASE_001);
    applyInterrogationOutput(suspectId, topic.promptQuestion, topic.id, 'ask', out);
  };

  const handlePressTopic = (suspectId: SuspectId, topic: DialogueTopic) => {
    const out = executeTopicPress(suspectId, topic, CASE_001);
    applyInterrogationOutput(suspectId, topic.pressPrompt, topic.id, 'press', out);
  };

  const handleChallengeTopic = (suspectId: SuspectId, topic: DialogueTopic) => {
    const out = executeTopicChallenge(suspectId, topic, state, CASE_001);
    applyInterrogationOutput(
      suspectId,
      topic.challengeStatement ?? 'I challenge your account.',
      topic.id,
      'challenge',
      out
    );
  };

  const handleObservePerson = (suspectId: SuspectId, obsId: string) => {
    const suspect = CASE_001.suspects.find((s) => s.id === suspectId);
    const pobs = suspect?.personObservations.find((o) => o.id === obsId);
    if (!pobs) return;

    setState((prev) => {
      const curr = prev.suspectState[suspectId];
      const already = curr.observedPersonIds.includes(obsId);
      let nextEv = prev.discoveredEvidenceIds;
      if (pobs.linkedEvidenceId && !nextEv.includes(pobs.linkedEvidenceId)) {
        nextEv = [...nextEv, pobs.linkedEvidenceId];
        soundEngine.playEffect('evidence');
      } else {
        soundEngine.playEffect('clue_sting');
      }
      const next: InvestigationState = {
        ...prev,
        discoveredEvidenceIds: nextEv,
        skills: !already ? applySkillGain(prev.skills, 'observation', 5) : prev.skills,
        suspectState: {
          ...prev.suspectState,
          [suspectId]: {
            ...curr,
            observedPersonIds: already ? curr.observedPersonIds : [...curr.observedPersonIds, obsId],
          },
        },
      };
      persistState(next);
      return next;
    });
  };

  const handleConfrontWithEvidence = (suspectId: SuspectId, evidenceIds: string[]): string => {
    const res = evaluateContradictionConfrontation(
      suspectId,
      evidenceIds,
      state.discoveredContradictionIds,
      CASE_001
    );

    if (res.matched && res.contradiction) {
      soundEngine.playEffect('contradiction');
      const con = res.contradiction;
      setState((prev) => {
        const curr = prev.suspectState[suspectId];
        const next: InvestigationState = {
          ...prev,
          discoveredContradictionIds: [...prev.discoveredContradictionIds, con.id],
          skills: applySkillGain(prev.skills, 'deduction', 8),
          suspectState: {
            ...prev.suspectState,
            [suspectId]: {
              ...curr,
              suspicion: Math.min(100, curr.suspicion + 18),
              trust: Math.max(0, curr.trust - 12),
              bodyLanguage: 'Tightened Jaw',
              alibiStatus: suspectId === 'pembroke' ? 'BROKEN' : 'QUESTIONABLE',
              dialogueLog: [
                ...curr.dialogueLog,
                { speaker: 'Detective', text: con.confrontationPrompt, cue: 'Confrontation' },
                {
                  speaker: CASE_001.suspects.find((s) => s.id === suspectId)?.name ?? 'Suspect',
                  text: con.suspectReaction,
                  cue: con.alibiStatusLabel,
                },
              ],
            },
          },
        };
        persistState(next);
        return next;
      });
      showToast(`Contradiction Exposed: ${con.alibiStatusLabel}`);
      return `${con.confrontationPrompt} — ${con.suspectReaction}`;
    }

    soundEngine.playEffect('wrong');
    return res.message;
  };

  // Mind Palace & Timeline Handlers
  const handleUnlockDeduction = (recipe: DeductionRecipe) => {
    soundEngine.playEffect('deduction_confirm');
    setState((prev) => {
      const nextLocations =
        recipe.unlocksLocationId && !prev.unlockedLocationIds.includes(recipe.unlocksLocationId)
          ? [...prev.unlockedLocationIds, recipe.unlocksLocationId]
          : prev.unlockedLocationIds;

      // Unlock Harley Street clinic once Whitechapel fraud is deduced
      const unlockedHarley =
        recipe.id === 'ded-medical-motive' && !nextLocations.includes('loc-doctor-office')
          ? [...nextLocations, 'loc-doctor-office']
          : nextLocations;

      const next: InvestigationState = {
        ...prev,
        solvedDeductionIds: [...prev.solvedDeductionIds, recipe.id],
        unlockedLocationIds: unlockedHarley,
        skills: applySkillGain(prev.skills, 'deduction', 10),
      };
      persistState(next);
      return next;
    });
    showToast(`Deduction Synthesized: ${recipe.title}`);
  };

  const handlePresentCase = (submission: AccusationSubmission) => {
    const outcome = evaluateFinalEnding(submission, state, CASE_001);
    setEndingOutcome(outcome);
    setGameMode('gameover');
    if (
      outcome.id === 'MASTER_DETECTIVE' ||
      outcome.id === 'HIDDEN_TRUTH' ||
      outcome.id === 'BRILLIANT_DETECTIVE'
    ) {
      soundEngine.playEffect('case_solved');
      markCaseSolvedInArchive(CASE_001.id, outcome.title);
      setArchiveEntries(loadArchiveProgress(CASE_ARCHIVE_LIST));
    } else {
      soundEngine.playEffect('thunder');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c0b] text-[#f2eadc] victorian-grain flex flex-col">
      {gameMode === 'title' ? (
        <TitleScreen
          hasSavedGame={Boolean(savedSnapshot)}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onBeginCase={handleBeginCase}
          onContinueCase={handleContinueCase}
          onOpenArchive={() => setShowArchive(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <>
          <GameHud
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            state={state}
            elapsedSeconds={elapsedSeconds}
            audioSettings={audioSettings}
            onToggleMute={handleToggleMute}
            onSaveGame={handleManualSave}
            onOpenDemo={() => setShowHowToPlay(true)}
            onOpenSettings={() => setShowSettings(true)}
            onPause={() => setGameMode('paused')}
            saveFeedback={saveFeedback}
            activeSubtitle={activeSubtitle}
          />

          {/* Non-blocking Discovery & Audio Caption Bar */}
          {(discoveryToast || activeSubtitle) && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1.5 px-4 w-full max-w-md">
              {discoveryToast && (
                <div
                  role="status"
                  aria-live="polite"
                  className="px-4 py-2.5 rounded bg-[#16110e]/95 border border-[#c99a4b] text-xs sm:text-sm text-[#f2eadc] shadow-2xl text-center"
                >
                  {discoveryToast}
                </div>
              )}
              {activeSubtitle && (
                <div className="px-3 py-1 rounded bg-[#0a0908]/90 border border-[#c99a4b]/25 text-[11px] font-mono-tabular text-[#c99a4b] text-center">
                  {activeSubtitle}
                </div>
              )}
            </div>
          )}

          <main className="flex-1 pb-12">
            <div key={activeSection} className="animate-section-enter">
              {activeSection === 'case' && (
              <CaseFileView
                caseDef={CASE_001}
                state={state}
                onCompleteChallenge={(challengeId, domain: keyof SkillMetrics) => {
                  soundEngine.playEffect('deduction_confirm');
                  setState((prev) => {
                    const next: InvestigationState = {
                      ...prev,
                      completedChallenges: { ...prev.completedChallenges, [challengeId]: true },
                      skills: applySkillGain(prev.skills, domain, 9),
                    };
                    persistState(next);
                    return next;
                  });
                }}
                onGoToObserve={() => handleSelectSection('observe')}
              />
            )}

            {activeSection === 'observe' && (
              <ObserveRoomView
                caseDef={CASE_001}
                activeRoomId={activeRoomId}
                onSelectRoom={(id) => {
                  soundEngine.playEffect('door_creak');
                  setActiveRoomId(id);
                }}
                discoveredObservationIds={state.discoveredObservationIds}
                difficulty={state.difficulty}
                onInspectObservation={handleInspectObservation}
              />
            )}

            {activeSection === 'suspects' && (
              <SuspectsView
                caseDef={CASE_001}
                state={state}
                selectedSuspectId={selectedSuspectId}
                onSelectSuspect={(id) => {
                  soundEngine.playEffect('click');
                  setSelectedSuspectId(id);
                }}
                onAskTopic={handleAskTopic}
                onPressTopic={handlePressTopic}
                onChallengeTopic={handleChallengeTopic}
                onObservePerson={handleObservePerson}
                onConfrontWithEvidence={handleConfrontWithEvidence}
              />
            )}

            {activeSection === 'evidence' && (
              <EvidenceView
                caseDef={CASE_001}
                state={state}
                onSetImportance={(evidenceId, importance: PlayerImportance) => {
                  soundEngine.playEffect('click');
                  setState((prev) => {
                    const next: InvestigationState = {
                      ...prev,
                      evidenceImportance: {
                        ...prev.evidenceImportance,
                        [evidenceId]: importance,
                      },
                    };
                    persistState(next);
                    return next;
                  });
                }}
              />
            )}

            {activeSection === 'timeline' && (
              <TimelineView
                caseDef={CASE_001}
                state={state}
                onUpdateTimelineOrder={(nextOrder) => {
                  soundEngine.playEffect('click');
                  setState((prev) => {
                    const next = { ...prev, playerTimelineOrder: nextOrder };
                    persistState(next);
                    return next;
                  });
                }}
                onVerifyTimelineSuccess={() => {
                  soundEngine.playEffect('deduction_confirm');
                  setState((prev) => {
                    const next = {
                      ...prev,
                      skills: applySkillGain(prev.skills, 'timeline', 8),
                    };
                    persistState(next);
                    return next;
                  });
                }}
              />
            )}

            {activeSection === 'mind_palace' && (
              <MindPalaceView
                caseDef={CASE_001}
                state={state}
                onUnlockDeduction={handleUnlockDeduction}
                onAddHypothesis={(theory: HypothesisTheory) => {
                  soundEngine.playEffect('paper');
                  setState((prev) => {
                    const next = { ...prev, hypotheses: [theory, ...prev.hypotheses] };
                    persistState(next);
                    return next;
                  });
                }}
                onUpdateHypothesisStatus={(id, status) => {
                  setState((prev) => {
                    const next = {
                      ...prev,
                      hypotheses: prev.hypotheses.map((h) =>
                        h.id === id ? { ...h, status } : h
                      ),
                    };
                    persistState(next);
                    return next;
                  });
                }}
                onDeleteHypothesis={(id) => {
                  setState((prev) => {
                    const next = {
                      ...prev,
                      hypotheses: prev.hypotheses.filter((h) => h.id !== id),
                    };
                    persistState(next);
                    return next;
                  });
                }}
              />
            )}

            {activeSection === 'map' && (
              <MapView
                caseDef={CASE_001}
                state={state}
                onTravelToRoom={(roomId) => {
                  soundEngine.playEffect('door_creak');
                  setActiveRoomId(roomId);
                  setActiveSection('observe');
                }}
              />
            )}

            {activeSection === 'notebook' && (
              <NotebookView
                caseDef={CASE_001}
                state={state}
                onUpdateNote={(key, val) => {
                  setState((prev) => {
                    const next = {
                      ...prev,
                      notebookNotes: { ...prev.notebookNotes, [key]: val },
                    };
                    persistState(next);
                    return next;
                  });
                }}
              />
            )}

              {activeSection === 'deductions' && (
                <FinalDeductionView
                  caseDef={CASE_001}
                  state={state}
                  onPresentCase={handlePresentCase}
                />
              )}
            </div>
          </main>
        </>
      )}

      {/* Modals */}
      {showArchive && (
        <CaseArchiveModal
          entries={archiveEntries}
          onLaunchCase001={handleBeginCase}
          onClose={() => setShowArchive(false)}
        />
      )}

      {showHowToPlay && (
        <InteractiveDemoModal
          isInGame={gameMode !== 'title'}
          onStartRealCase={handleBeginCase}
          onClose={() => setShowHowToPlay(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          audio={audioSettings}
          a11y={a11ySettings}
          onUpdateAudio={setAudioSettings}
          onTestAudio={() => {
            void soundEngine.playTestSound();
          }}
          onUpdateA11y={setA11ySettings}
          onResetCase={
            gameMode !== 'title'
              ? () => {
                  clearSavedInvestigation();
                  setSavedSnapshot(null);
                  setShowSettings(false);
                  handleBeginCase();
                }
              : undefined
          }
          onClose={() => setShowSettings(false)}
        />
      )}

      {gameMode === 'paused' && (
        <PauseModal
          onResume={() => setGameMode('playing')}
          onSave={handleManualSave}
          onRestart={handleBeginCase}
          onReturnToTitle={() => {
            setGameMode('title');
          }}
        />
      )}

      {gameMode === 'gameover' && endingOutcome && (
        <CinematicEndingModal
          caseDef={CASE_001}
          outcome={endingOutcome}
          elapsedSeconds={elapsedSeconds}
          onReplayCase={handleBeginCase}
          onReturnToTitle={() => {
            setEndingOutcome(null);
            setGameMode('title');
          }}
          onReviewInvestigation={() => {
            setEndingOutcome(null);
            setGameMode('playing');
          }}
        />
      )}
    </div>
  );
}
