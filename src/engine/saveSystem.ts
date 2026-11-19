import {
  AccessibilitySettings,
  AudioSettings,
  CaseArchiveEntry,
  CaseDefinition,
  DifficultyLevel,
  InvestigationState,
  SuspectId,
} from '../types/game';

const STORAGE_KEYS = {
  INVESTIGATION: 'gilded_riddle_save_v1',
  AUDIO: 'gilded_riddle_audio_v1',
  ACCESSIBILITY: 'gilded_riddle_a11y_v1',
  ARCHIVE: 'gilded_riddle_archive_v1',
};

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function createInitialInvestigationState(
  caseDef: CaseDefinition,
  difficulty: DifficultyLevel = 'detective'
): InvestigationState {
  const defaultEvidence = caseDef.evidence
    .filter((e) => e.unlockedByDefault)
    .map((e) => e.id);

  const defaultTimeline = caseDef.timelineEvents
    .filter((t) => t.unlockedByDefault)
    .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
    .map((t) => t.id);

  const defaultLocations = caseDef.mapLocations
    .filter((l) => l.unlockedByDefault)
    .map((l) => l.id);

  const suspectState = {} as InvestigationState['suspectState'];
  for (const s of caseDef.suspects) {
    suspectState[s.id as SuspectId] = {
      suspicion: s.initialSuspicion,
      trust: s.initialTrust,
      bodyLanguage: 'Composure Intact',
      observedPersonIds: [],
      askedTopicIds: [],
      pressedTopicIds: [],
      challengedTopicIds: [],
      alibiStatus: 'UNCHECKED',
      dialogueLog: [
        {
          speaker: s.name,
          text: `Statement on record: "${s.alibi}"`,
          cue: 'Initial Dossier',
        },
      ],
    };
  }

  return {
    caseId: caseDef.id,
    difficulty,
    discoveredObservationIds: [],
    discoveredEvidenceIds: defaultEvidence,
    discoveredTimelineIds: defaultTimeline,
    playerTimelineOrder: defaultTimeline,
    solvedDeductionIds: [],
    discoveredContradictionIds: [],
    unlockedLocationIds: defaultLocations,
    completedChallenges: {},
    evidenceImportance: {},
    suspectState,
    hypotheses: [
      {
        id: 'hyp-starter-1',
        title: 'Initial Assumption: Financial Inheritance',
        suspectId: 'evelyn',
        summary: 'Test whether Sir Reginald’s planned will revision gave Lady Evelyn motive and opportunity.',
        supportingClueIds: ['ev-case-brief'],
        weaknessNote: 'Needs proof of poison knowledge and locked-room exit.',
        status: 'ACTIVE',
        createdAt: '11:50 PM',
      },
    ],
    notebookNotes: {
      summary: 'Arrived at Ashcroft Manor during violent storm. Study door bolted from within at 11:43 PM.',
      questions: 'How was the inside brass thumb-bolt engaged with no one inside? Why does the Study clock differ from Inspector Harrow’s watch?',
      unsolved: 'Verify exact time of collapse relative to the 11:26 PM lightning surge.',
    },
    solvedQuestions: [],
    skills: {
      observation: 20,
      logic: 20,
      interrogation: 20,
      forensics: 20,
      timeline: 20,
      deduction: 20,
    },
    elapsedSeconds: 0,
    lastSavedAt: null,
  };
}

export function formatCaseDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function saveInvestigation(state: InvestigationState): { ok: boolean; savedAt: string } {
  const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (!hasStorage()) return { ok: false, savedAt };
  try {
    const payload: InvestigationState = { ...state, lastSavedAt: savedAt };
    window.localStorage.setItem(STORAGE_KEYS.INVESTIGATION, JSON.stringify(payload));
    return { ok: true, savedAt };
  } catch {
    return { ok: false, savedAt };
  }
}

export function loadInvestigation(): InvestigationState | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.INVESTIGATION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InvestigationState;
    if (!parsed || !parsed.caseId || !parsed.suspectState) return null;
    return {
      ...parsed,
      elapsedSeconds: typeof parsed.elapsedSeconds === 'number' ? parsed.elapsedSeconds : 0,
    };
  } catch {
    return null;
  }
}

export function clearSavedInvestigation(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.INVESTIGATION);
  } catch {
    // ignore storage errors
  }
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicEnabled: true,
  effectsEnabled: true,
  ambienceEnabled: true,
  masterVolume: 0.85,
  musicVolume: 0.65,
  ambienceVolume: 0.7,
  effectsVolume: 0.85,
};

export function loadAudioSettings(): AudioSettings {
  if (!hasStorage()) return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUDIO);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.AUDIO, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  textSize: 'standard',
  reducedMotion: false,
  subtitlesEnabled: true,
  highContrast: false,
};

export function loadA11ySettings(): AccessibilitySettings {
  if (!hasStorage()) return DEFAULT_A11Y_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
    if (!raw) return DEFAULT_A11Y_SETTINGS;
    return { ...DEFAULT_A11Y_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_A11Y_SETTINGS;
  }
}

export function saveA11ySettings(settings: AccessibilitySettings): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadArchiveProgress(defaults: CaseArchiveEntry[]): CaseArchiveEntry[] {
  if (!hasStorage()) return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ARCHIVE);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Record<string, { status: 'AVAILABLE' | 'SOLVED'; bestEndingTitle?: string }>;
    return defaults.map((entry) =>
      saved[entry.id]
        ? {
            ...entry,
            status: saved[entry.id].status,
            bestEndingTitle: saved[entry.id].bestEndingTitle,
          }
        : entry
    );
  } catch {
    return defaults;
  }
}

export function markCaseSolvedInArchive(caseId: string, endingTitle: string): void {
  if (!hasStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ARCHIVE);
    const map = raw ? JSON.parse(raw) : {};
    map[caseId] = { status: 'SOLVED', bestEndingTitle: endingTitle };
    window.localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(map));
  } catch {
    // ignore
  }
}
