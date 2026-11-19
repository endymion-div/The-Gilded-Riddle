import { CaseDefinition, ContradictionDefinition, SuspectId } from '../types/game';

export interface ConfrontationResult {
  matched: boolean;
  contradiction?: ContradictionDefinition;
  message: string;
  suspectReaction?: string;
}

/**
 * Checks whether presenting selected evidence IDs against a suspect exposes
 * a logical contradiction in their testimony.
 */
export function evaluateContradictionConfrontation(
  suspectId: SuspectId,
  presentedEvidenceIds: string[],
  discoveredContradictionIds: string[],
  caseDef: CaseDefinition
): ConfrontationResult {
  const unique = Array.from(new Set(presentedEvidenceIds));
  if (unique.length === 0) {
    return {
      matched: false,
      message: 'Select at least one piece of discovered evidence to confront the suspect.',
    };
  }

  const suspectContradictions = caseDef.contradictions.filter((c) => c.suspectId === suspectId);

  for (const con of suspectContradictions) {
    const hasMatch = con.contradictingEvidenceIds.some((reqId) => unique.includes(reqId));
    const allPresent = con.contradictingEvidenceIds.every((reqId) => unique.includes(reqId));

    if (allPresent || (con.contradictingEvidenceIds.length === 1 && hasMatch)) {
      if (discoveredContradictionIds.includes(con.id)) {
        return {
          matched: false,
          contradiction: con,
          message: `You have already confronted this inconsistency: "${con.claimStatement}"`,
        };
      }
      return {
        matched: true,
        contradiction: con,
        message: con.confrontationPrompt,
        suspectReaction: con.suspectReaction,
      };
    }

    if (hasMatch && con.contradictingEvidenceIds.length > 1) {
      return {
        matched: false,
        message:
          'You hold one piece of the contradiction, but the suspect can explain it away unless you present the corroborating evidence alongside it.',
      };
    }
  }

  return {
    matched: false,
    message:
      'The suspect dismisses the exhibit calmly—this evidence does not directly contradict their recorded statement.',
  };
}
