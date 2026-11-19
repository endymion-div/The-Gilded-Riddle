export type GameMode = 'title' | 'playing' | 'paused' | 'gameover';

export type DifficultyLevel = 'novice' | 'detective' | 'consulting';

export type HudSection =
  | 'case'
  | 'observe'
  | 'suspects'
  | 'evidence'
  | 'timeline'
  | 'mind_palace'
  | 'map'
  | 'notebook'
  | 'deductions';

export type EvidenceCategory =
  | 'PHYSICAL'
  | 'DOCUMENT'
  | 'FORENSIC'
  | 'TESTIMONY'
  | 'TELEGRAPH'
  | 'ENVIRONMENTAL'
  | 'TIMELINE'
  | 'BEHAVIORAL';

export type EvidenceReliability = 'CONFIRMED' | 'PROBABLE' | 'POSSIBLE' | 'UNVERIFIED';

export type PlayerImportance = 'UNMARKED' | 'CRITICAL' | 'SUPPORTING' | 'RED_HERRING';

export type SuspectId =
  | 'evelyn'
  | 'edward'
  | 'pembroke'
  | 'beatrice'
  | 'ward'
  | 'harrow';

export type RoomId = 'study' | 'library' | 'conservatory' | 'grounds';

export type InterrogationAction =
  | 'ASK'
  | 'PRESS'
  | 'OBSERVE'
  | 'CHALLENGE'
  | 'PRESENT_EVIDENCE'
  | 'CHANGE_SUBJECT'
  | 'END_INTERVIEW';

export type BodyLanguageCue =
  | 'Composure Intact'
  | 'Looking Away'
  | 'Nervous Hand Movement'
  | 'Tightened Jaw'
  | 'Measured Hesitation'
  | 'Defensive Posture'
  | 'Avoiding Eye Contact'
  | 'Calm Confidence';

export type MusicTensionState =
  | 'NORMAL'
  | 'INVESTIGATION'
  | 'SUSPICION'
  | 'DISCOVERY'
  | 'DANGER'
  | 'FINAL_DEDUCTION'
  | 'CASE_SOLVED';

export type EndingId =
  | 'MASTER_DETECTIVE'
  | 'BRILLIANT_DETECTIVE'
  | 'PARTIAL_TRUTH'
  | 'WRONG_ACCUSATION'
  | 'UNSOLVED_CASE'
  | 'FALSE_TRAIL'
  | 'HIDDEN_TRUTH';

export interface EvidenceItem {
  id: string;
  name: string;
  category: EvidenceCategory;
  description: string;
  whereFound: string;
  timeFound: string;
  relatedSuspects: SuspectId[];
  possibleInterpretation: string;
  alternativeInterpretation: string;
  reliability: EvidenceReliability;
  /** Hidden internal weight for scoring, never displayed to the player */
  truthWeight: number;
  isRedHerring?: boolean;
  unlockedByDefault?: boolean;
}

export interface ObservationItem {
  id: string;
  title: string;
  roomId: RoomId;
  detail: string;
  subtleHint: string;
  linkedEvidenceId?: string;
  linkedTimelineId?: string;
  linkedFactId?: string;
  isSubtleAnomaly?: boolean;
}

export interface RoomHotspot {
  id: string;
  label: string;
  /** Coordinates in percentage (0-100) for responsive room overlay */
  x: number;
  y: number;
  /** Visible immediately or highlighted more clearly in Observe Mode */
  requiresObserveMode?: boolean;
  observationId: string;
  /** Optional prerequisite observation before this tiny anomaly is spotted */
  prerequisiteObservationId?: string;
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  subtitle: string;
  backdropImage: string;
  atmosphereNote: string;
  hotspots: RoomHotspot[];
}

export interface PersonObservation {
  id: string;
  label: string;
  detail: string;
  linkedEvidenceId?: string;
}

export interface DialogueTopic {
  id: string;
  label: string;
  promptQuestion: string;
  initialResponse: string;
  initialBodyLanguage: BodyLanguageCue;
  pressPrompt: string;
  pressResponse: string;
  pressBodyLanguage: BodyLanguageCue;
  pressUnlocksEvidenceId?: string;
  pressUnlocksTimelineId?: string;
  challengeStatement?: string;
  requiredEvidenceForChallenge?: string;
  challengeSuccessResponse?: string;
  challengeBodyLanguage?: BodyLanguageCue;
  challengeUnlocksEvidenceId?: string;
  challengeUnlocksContradictionId?: string;
}

export interface SuspectProfile {
  id: SuspectId;
  name: string;
  age: number;
  occupation: string;
  portraitUrl: string;
  personality: string;
  relationship: string;
  publicMotive: string;
  hiddenMotive: string;
  alibi: string;
  secret: string;
  psychologicalProfile: string;
  speakingStyle: string;
  initialSuspicion: number;
  initialTrust: number;
  knownFacts: string[];
  unknownFacts: string[];
  personalTimeline: string[];
  personObservations: PersonObservation[];
  topics: DialogueTopic[];
}

export interface TimelineEvent {
  id: string;
  displayTime: string;
  chronologicalOrder: number;
  title: string;
  description: string;
  source: string;
  unlockedByDefault?: boolean;
  isCrimeReconstructionBeat?: boolean;
}

export interface ContradictionDefinition {
  id: string;
  suspectId: SuspectId;
  claimStatement: string;
  contradictingEvidenceIds: string[];
  confrontationPrompt: string;
  suspectReaction: string;
  deducedImplication: string;
  alibiStatusLabel: string;
}

export interface DeductionRecipe {
  id: string;
  title: string;
  requiredClueIds: string[];
  resultConclusion: string;
  reasoningExplanation: string;
  unlocksQuestion?: string;
  unlocksEvidenceId?: string;
  unlocksLocationId?: string;
  isCriticalPath?: boolean;
  isHiddenTruth?: boolean;
}

export interface ReasoningChallenge {
  id: string;
  title: string;
  prompt: string;
  options: { id: string; label: string; feedback: string }[];
  correctOptionId: string;
  skillDomain: keyof SkillMetrics;
}

export interface HypothesisTheory {
  id: string;
  title: string;
  suspectId: SuspectId;
  summary: string;
  supportingClueIds: string[];
  weaknessNote: string;
  status: 'ACTIVE' | 'DISCARDED' | 'CONFIRMED';
  createdAt: string;
}

export interface MapLocation {
  id: string;
  name: string;
  district: string;
  x: number;
  y: number;
  walkMinutesFromStudy?: number;
  description: string;
  unlockedByDefault?: boolean;
  roomId?: RoomId;
  leadClueText?: string;
}

export interface SkillMetrics {
  observation: number;
  logic: number;
  interrogation: number;
  forensics: number;
  timeline: number;
  deduction: number;
}

export interface AccusationSubmission {
  murdererId: SuspectId | '';
  motiveId: string;
  methodId: string;
  opportunityId: string;
  timeOfDeathId: string;
  decisiveEvidenceIds: string[];
  falseStatementId: string;
  killersMistakeId: string;
  reconstructionOrder: string[];
}

export interface EndingOutcome {
  id: EndingId;
  title: string;
  subtitle: string;
  verdictSummary: string;
  logicalBreakdown: string[];
  rankLabel: string;
  score: number;
}

export interface AudioSettings {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  ambienceEnabled: boolean;
  masterVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  effectsVolume: number;
}

export interface AccessibilitySettings {
  textSize: 'compact' | 'standard' | 'large';
  reducedMotion: boolean;
  subtitlesEnabled: boolean;
  highContrast: boolean;
}

export interface CaseArchiveEntry {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: 'AVAILABLE' | 'SOLVED' | 'LOCKED_PREVIEW';
  bestEndingTitle?: string;
}

export interface InvestigationState {
  caseId: string;
  difficulty: DifficultyLevel;
  discoveredObservationIds: string[];
  discoveredEvidenceIds: string[];
  discoveredTimelineIds: string[];
  playerTimelineOrder: string[];
  solvedDeductionIds: string[];
  discoveredContradictionIds: string[];
  unlockedLocationIds: string[];
  completedChallenges: Record<string, boolean>;
  evidenceImportance: Record<string, PlayerImportance>;
  suspectState: Record<
    SuspectId,
    {
      suspicion: number;
      trust: number;
      bodyLanguage: BodyLanguageCue;
      observedPersonIds: string[];
      askedTopicIds: string[];
      pressedTopicIds: string[];
      challengedTopicIds: string[];
      alibiStatus: 'UNCHECKED' | 'QUESTIONABLE' | 'BROKEN' | 'CORROBORATED';
      dialogueLog: { speaker: string; text: string; cue?: string }[];
    }
  >;
  hypotheses: HypothesisTheory[];
  notebookNotes: Record<string, string>;
  solvedQuestions: string[];
  skills: SkillMetrics;
  elapsedSeconds: number;
  lastSavedAt: string | null;
}

export interface CaseDefinition {
  id: string;
  code: string;
  title: string;
  tagline: string;
  location: string;
  discoveryTime: string;
  victim: {
    name: string;
    age: number;
    occupation: string;
    estimatedDeathWindow: string;
    initialCause: string;
    forensicSecretCause: string;
    briefingSummary: string;
  };
  rooms: RoomDefinition[];
  suspects: SuspectProfile[];
  evidence: EvidenceItem[];
  observations: ObservationItem[];
  timelineEvents: TimelineEvent[];
  contradictions: ContradictionDefinition[];
  deductionRecipes: DeductionRecipe[];
  reasoningChallenges: ReasoningChallenge[];
  mapLocations: MapLocation[];
  accusationChoices: {
    motives: { id: string; label: string }[];
    methods: { id: string; label: string }[];
    opportunities: { id: string; label: string }[];
    timesOfDeath: { id: string; label: string }[];
    falseStatements: { id: string; label: string }[];
    killersMistakes: { id: string; label: string }[];
  };
  canonicalSolution: {
    murdererId: SuspectId;
    motiveId: string;
    methodId: string;
    opportunityId: string;
    timeOfDeathId: string;
    requiredEvidenceIds: string[];
    falseStatementId: string;
    killersMistakeId: string;
    reconstructionSequenceIds: string[];
    redHerringSuspectIds: SuspectId[];
    hiddenTruthRecipeId: string;
  };
  reconstructionNarration: {
    time: string;
    title: string;
    detail: string;
  }[];
}
