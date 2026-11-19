import {
  CaseDefinition,
  DeductionRecipe,
  DifficultyLevel,
  InvestigationState,
  ReasoningChallenge,
  SkillMetrics,
} from '../types/game';

export interface ClueCombinationResult {
  matched: boolean;
  alreadySolved?: boolean;
  recipe?: DeductionRecipe;
  feedback: string;
}

/**
 * Evaluates whether a set of 2-3 clue/evidence IDs selected in the Mind Palace
 * logically synthesizes into one of the authored DeductionRecipes.
 */
export function evaluateClueCombination(
  selectedClueIds: string[],
  solvedDeductionIds: string[],
  caseDef: CaseDefinition,
  difficulty: DifficultyLevel
): ClueCombinationResult {
  const unique = Array.from(new Set(selectedClueIds));
  if (unique.length < 2) {
    return {
      matched: false,
      feedback: 'Select at least two pieces of evidence or observations to test a logical connection.',
    };
  }

  for (const recipe of caseDef.deductionRecipes) {
    const req = recipe.requiredClueIds;
    const allRequiredPresent = req.every((id) => unique.includes(id));
    const exactMatch = allRequiredPresent && unique.length === req.length;

    if (exactMatch) {
      if (solvedDeductionIds.includes(recipe.id)) {
        return {
          matched: false,
          alreadySolved: true,
          recipe,
          feedback: `You have already synthesized "${recipe.title}".`,
        };
      }
      return {
        matched: true,
        recipe,
        feedback: recipe.resultConclusion,
      };
    }
  }

  // Provide calibrated partial reasoning hints based on difficulty without giving away the answer
  if (difficulty !== 'consulting') {
    let bestOverlap = 0;
    let bestRecipe: DeductionRecipe | null = null;
    for (const recipe of caseDef.deductionRecipes) {
      if (solvedDeductionIds.includes(recipe.id)) continue;
      const overlap = unique.filter((id) => recipe.requiredClueIds.includes(id)).length;
      if (overlap > bestOverlap && overlap >= 2) {
        bestOverlap = overlap;
        bestRecipe = recipe;
      }
    }

    if (bestRecipe && bestOverlap === unique.length && unique.length < bestRecipe.requiredClueIds.length) {
      return {
        matched: false,
        feedback:
          difficulty === 'novice'
            ? `These ${bestOverlap} clues point toward "${bestRecipe.title}", but you still need ${bestRecipe.requiredClueIds.length - bestOverlap} more corroborating fact.`
            : 'These facts point in a promising direction, yet one further corroborating detail is missing to complete the deduction.',
      };
    }
  }

  return {
    matched: false,
    feedback: 'These details do not form a rigorous logical link on their own. Re-examine timestamps, physical forensics, or motives.',
  };
}

export function evaluateReasoningChallenge(
  challenge: ReasoningChallenge,
  chosenOptionId: string
): { correct: boolean; feedback: string; skillDomain: keyof SkillMetrics } {
  const option = challenge.options.find((o) => o.id === chosenOptionId);
  const correct = chosenOptionId === challenge.correctOptionId;
  return {
    correct,
    feedback: option ? option.feedback : 'Select a reasoned conclusion.',
    skillDomain: challenge.skillDomain,
  };
}

export function computeOverallDetectiveRating(skills: SkillMetrics): {
  average: number;
  title: string;
} {
  const values = Object.values(skills);
  const average = Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
  if (average >= 85) return { average, title: 'Master Consulting Detective' };
  if (average >= 65) return { average, title: 'Senior Investigator' };
  if (average >= 45) return { average, title: 'Field Detective' };
  return { average, title: 'Apprentice Observer' };
}

export function applySkillGain(
  skills: SkillMetrics,
  domain: keyof SkillMetrics,
  amount: number
): SkillMetrics {
  return {
    ...skills,
    [domain]: Math.min(100, Math.max(0, skills[domain] + amount)),
  };
}

export function getObservationHint(
  difficulty: DifficultyLevel,
  subtleHint: string
): string | null {
  if (difficulty === 'consulting') return null;
  if (difficulty === 'detective') {
    return 'Examine how this detail interacts with clock times or physical entry.';
  }
  return subtleHint;
}

export function countCriticalDiscoveries(
  state: InvestigationState,
  caseDef: CaseDefinition
): { discovered: number; total: number } {
  const critical = caseDef.canonicalSolution.requiredEvidenceIds;
  const discovered = critical.filter((id) => state.discoveredEvidenceIds.includes(id)).length;
  return { discovered, total: critical.length };
}
