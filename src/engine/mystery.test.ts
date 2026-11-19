import test from 'node:test';
import assert from 'node:assert/strict';
import { CASE_001 } from '../data/case001';
import {
  evaluateClueCombination,
  evaluateReasoningChallenge,
  computeOverallDetectiveRating,
} from './deductionEngine';
import { evaluateContradictionConfrontation } from './contradictionEngine';
import { validateTimelineOrder, reorderTimelineList } from './timelineEngine';
import { executeTopicChallenge, executeTopicPress } from './interrogationEngine';
import { evaluateFinalEnding } from './endingEngine';
import { createInitialInvestigationState, formatCaseDuration } from './saveSystem';
import { AccusationSubmission } from '../types/game';

test('Case 001 has 6 suspects, 4 rooms, and internally consistent canonical IDs', () => {
  assert.equal(CASE_001.suspects.length, 6);
  assert.equal(CASE_001.rooms.length, 4);

  const evidenceIds = new Set(CASE_001.evidence.map((e) => e.id));
  for (const reqId of CASE_001.canonicalSolution.requiredEvidenceIds) {
    assert.ok(evidenceIds.has(reqId), `Missing canonical evidence ${reqId}`);
  }

  for (const recipe of CASE_001.deductionRecipes) {
    for (const id of recipe.requiredClueIds) {
      assert.ok(evidenceIds.has(id), `Recipe ${recipe.id} references unknown clue ${id}`);
    }
  }
});

test('Mind Palace clue combination solves valid deduction and rejects invalid links', () => {
  const valid = evaluateClueCombination(
    ['ev-wet-umbrella', 'ev-dry-corridor', 'ev-rain-report'],
    [],
    CASE_001,
    'detective'
  );
  assert.equal(valid.matched, true);
  assert.equal(valid.recipe?.id, 'ded-umbrella-timing');

  const partial = evaluateClueCombination(
    ['ev-wet-umbrella', 'ev-dry-corridor'],
    [],
    CASE_001,
    'novice'
  );
  assert.equal(partial.matched, false);
  assert.match(partial.feedback, /Corridor & Rain Timing/);

  const wrong = evaluateClueCombination(
    ['ev-wet-umbrella', 'ev-burned-will'],
    [],
    CASE_001,
    'consulting'
  );
  assert.equal(wrong.matched, false);
});

test('Contradiction engine exposes Dr. Pembroke clock lie and Edward umbrella lie', () => {
  const edward = evaluateContradictionConfrontation(
    'edward',
    ['ev-wet-umbrella', 'ev-rain-report'],
    [],
    CASE_001
  );
  assert.equal(edward.matched, true);
  assert.equal(edward.contradiction?.id, 'con-edward-umbrella');

  const pembrokePartial = evaluateContradictionConfrontation(
    'pembroke',
    ['ev-slow-clock'],
    [],
    CASE_001
  );
  assert.equal(pembrokePartial.matched, false);

  const pembrokeFull = evaluateContradictionConfrontation(
    'pembroke',
    ['ev-slow-clock', 'ev-evelyn-flicker-admission'],
    [],
    CASE_001
  );
  assert.equal(pembrokeFull.matched, true);
  assert.equal(pembrokeFull.contradiction?.id, 'con-pembroke-clock');
});

test('Timeline engine validates chronological order and detects swaps', () => {
  const sorted = [...CASE_001.timelineEvents]
    .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
    .map((e) => e.id);

  const valid = validateTimelineOrder(sorted, CASE_001);
  assert.equal(valid.isExactChronologicalOrder, true);
  assert.equal(valid.misplacedCount, 0);

  const swapped = reorderTimelineList(sorted, 0, 2);
  const invalid = validateTimelineOrder(swapped, CASE_001);
  assert.equal(invalid.isExactChronologicalOrder, false);
  assert.ok(invalid.misplacedCount > 0);
});

test('Interrogation engine gates challenge on evidence and unlocks press evidence', () => {
  const state = createInitialInvestigationState(CASE_001, 'detective');
  const pembroke = CASE_001.suspects.find((s) => s.id === 'pembroke')!;
  const topic = pembroke.topics[0];

  const pressed = executeTopicPress('pembroke', topic, CASE_001);
  assert.equal(pressed.unlockedEvidenceId, 'ev-pembroke-clock-claim');

  const blockedChallenge = executeTopicChallenge('pembroke', topic, state, CASE_001);
  assert.equal(blockedChallenge.unlockedContradictionId, undefined);

  state.discoveredEvidenceIds.push('ev-slow-clock');
  const successChallenge = executeTopicChallenge('pembroke', topic, state, CASE_001);
  assert.equal(successChallenge.unlockedContradictionId, 'con-pembroke-clock');
});

test('Reasoning challenges and skill rating calculate properly', () => {
  const chal = CASE_001.reasoningChallenges[0];
  const res = evaluateReasoningChallenge(chal, 'opt-1126');
  assert.equal(res.correct, true);

  const rating = computeOverallDetectiveRating({
    observation: 90,
    logic: 88,
    interrogation: 85,
    forensics: 92,
    timeline: 86,
    deduction: 90,
  });
  assert.equal(rating.title, 'Master Consulting Detective');
});

test('Ending engine distinguishes all 7 endings accurately', () => {
  const fullState = createInitialInvestigationState(CASE_001, 'detective');
  fullState.discoveredEvidenceIds = CASE_001.evidence.map((e) => e.id);

  const perfectSubmission: AccusationSubmission = {
    murdererId: 'pembroke',
    motiveId: 'motive-malpractice',
    methodId: 'method-poison-catgut',
    opportunityId: 'opp-pembroke-window',
    timeOfDeathId: 'tod-before-1126',
    decisiveEvidenceIds: [...CASE_001.canonicalSolution.requiredEvidenceIds],
    falseStatementId: 'false-pembroke-1124',
    killersMistakeId: 'mistake-slow-clock',
    reconstructionOrder: [...CASE_001.canonicalSolution.reconstructionSequenceIds],
  };

  // 1. MASTER_DETECTIVE
  assert.equal(
    evaluateFinalEnding(perfectSubmission, fullState, CASE_001).id,
    'MASTER_DETECTIVE'
  );

  // 2. HIDDEN_TRUTH
  fullState.solvedDeductionIds.push('ded-hidden-estate-truth');
  assert.equal(
    evaluateFinalEnding(perfectSubmission, fullState, CASE_001).id,
    'HIDDEN_TRUTH'
  );

  // 3. BRILLIANT_DETECTIVE (misses some secondary details)
  fullState.solvedDeductionIds = [];
  const brilliantSub: AccusationSubmission = {
    ...perfectSubmission,
    falseStatementId: 'false-edward-1050',
    killersMistakeId: 'mistake-wet-umbrella',
  };
  assert.equal(
    evaluateFinalEnding(brilliantSub, fullState, CASE_001).id,
    'BRILLIANT_DETECTIVE'
  );

  // 4. PARTIAL_TRUTH (right killer, wrong method)
  const partialSub: AccusationSubmission = {
    ...perfectSubmission,
    methodId: 'method-passage-knife',
  };
  assert.equal(
    evaluateFinalEnding(partialSub, fullState, CASE_001).id,
    'PARTIAL_TRUTH'
  );

  // 5. FALSE_TRAIL (accused red herring)
  const falseTrailSub: AccusationSubmission = {
    ...perfectSubmission,
    murdererId: 'edward',
  };
  assert.equal(
    evaluateFinalEnding(falseTrailSub, fullState, CASE_001).id,
    'FALSE_TRAIL'
  );

  // 6. WRONG_ACCUSATION (accused non-red-herring innocent)
  const wrongSub: AccusationSubmission = {
    ...perfectSubmission,
    murdererId: 'ward',
  };
  assert.equal(
    evaluateFinalEnding(wrongSub, fullState, CASE_001).id,
    'WRONG_ACCUSATION'
  );

  // 7. UNSOLVED_CASE (insufficient evidence)
  const emptyState = createInitialInvestigationState(CASE_001, 'detective');
  assert.equal(
    evaluateFinalEnding(perfectSubmission, emptyState, CASE_001).id,
    'UNSOLVED_CASE'
  );
});

test('Case timer formats MM:SS and HH:MM:SS cleanly and initializes to 0', () => {
  const initial = createInitialInvestigationState(CASE_001, 'detective');
  assert.equal(initial.elapsedSeconds, 0);
  assert.equal(formatCaseDuration(0), '00:00');
  assert.equal(formatCaseDuration(65), '01:05');
  assert.equal(formatCaseDuration(3661), '01:01:01');
});
