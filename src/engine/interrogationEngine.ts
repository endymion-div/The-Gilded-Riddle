import {
  BodyLanguageCue,
  CaseDefinition,
  DialogueTopic,
  InvestigationState,
  SuspectId,
} from '../types/game';

export interface InterrogationTurnOutput {
  speaker: string;
  responseText: string;
  bodyLanguage: BodyLanguageCue;
  suspicionDelta: number;
  trustDelta: number;
  unlockedEvidenceId?: string;
  unlockedTimelineId?: string;
  unlockedContradictionId?: string;
  newAlibiStatus?: 'UNCHECKED' | 'QUESTIONABLE' | 'BROKEN' | 'CORROBORATED';
}

export function executeTopicAsk(
  suspectId: SuspectId,
  topic: DialogueTopic,
  caseDef: CaseDefinition
): InterrogationTurnOutput {
  const suspect = caseDef.suspects.find((s) => s.id === suspectId);
  return {
    speaker: suspect?.name ?? 'Suspect',
    responseText: topic.initialResponse,
    bodyLanguage: topic.initialBodyLanguage,
    suspicionDelta: 2,
    trustDelta: 2,
  };
}

export function executeTopicPress(
  suspectId: SuspectId,
  topic: DialogueTopic,
  caseDef: CaseDefinition
): InterrogationTurnOutput {
  const suspect = caseDef.suspects.find((s) => s.id === suspectId);
  return {
    speaker: suspect?.name ?? 'Suspect',
    responseText: topic.pressResponse,
    bodyLanguage: topic.pressBodyLanguage,
    suspicionDelta: 6,
    trustDelta: -4,
    unlockedEvidenceId: topic.pressUnlocksEvidenceId,
    unlockedTimelineId: topic.pressUnlocksTimelineId,
  };
}

export function executeTopicChallenge(
  suspectId: SuspectId,
  topic: DialogueTopic,
  state: InvestigationState,
  caseDef: CaseDefinition
): InterrogationTurnOutput {
  const suspect = caseDef.suspects.find((s) => s.id === suspectId);
  const reqEv = topic.requiredEvidenceForChallenge;

  if (reqEv && !state.discoveredEvidenceIds.includes(reqEv)) {
    return {
      speaker: suspect?.name ?? 'Suspect',
      responseText:
        'You make bold insinuations without hard proof in hand. Bring me concrete evidence if you wish to challenge my word.',
      bodyLanguage: 'Calm Confidence',
      suspicionDelta: 0,
      trustDelta: -6,
    };
  }

  return {
    speaker: suspect?.name ?? 'Suspect',
    responseText:
      topic.challengeSuccessResponse ??
      'The suspect hesitates sharply before offering a guarded revision.',
    bodyLanguage: topic.challengeBodyLanguage ?? 'Tightened Jaw',
    suspicionDelta: 12,
    trustDelta: -10,
    unlockedEvidenceId: topic.challengeUnlocksEvidenceId,
    unlockedContradictionId: topic.challengeUnlocksContradictionId,
    newAlibiStatus: topic.challengeUnlocksContradictionId ? 'BROKEN' : 'QUESTIONABLE',
  };
}
