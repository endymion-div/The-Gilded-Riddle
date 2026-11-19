import {
  AccusationSubmission,
  CaseDefinition,
  EndingOutcome,
  InvestigationState,
} from '../types/game';

/**
 * Evaluates the player's Final Accusation, Crime Reconstruction sequence,
 * and investigation thoroughness to award one of 7 distinct endings.
 */
export function evaluateFinalEnding(
  submission: AccusationSubmission,
  state: InvestigationState,
  caseDef: CaseDefinition
): EndingOutcome {
  const sol = caseDef.canonicalSolution;
  const evidenceCount = state.discoveredEvidenceIds.length;
  const criticalEvidenceMatched = sol.requiredEvidenceIds.filter((id) =>
    submission.decisiveEvidenceIds.includes(id)
  ).length;

  const murdererCorrect = submission.murdererId === sol.murdererId;
  const motiveCorrect = submission.motiveId === sol.motiveId;
  const methodCorrect = submission.methodId === sol.methodId;
  const opportunityCorrect = submission.opportunityId === sol.opportunityId;
  const todCorrect = submission.timeOfDeathId === sol.timeOfDeathId;
  const falseStatementCorrect = submission.falseStatementId === sol.falseStatementId;
  const mistakeCorrect = submission.killersMistakeId === sol.killersMistakeId;

  const reconstructionCorrect =
    submission.reconstructionOrder.length === sol.reconstructionSequenceIds.length &&
    submission.reconstructionOrder.every(
      (id, idx) => id === sol.reconstructionSequenceIds[idx]
    );

  const hiddenTruthUnlocked = state.solvedDeductionIds.includes(sol.hiddenTruthRecipeId);

  const secondaryCorrectCount = [
    motiveCorrect,
    opportunityCorrect,
    todCorrect,
    falseStatementCorrect,
    mistakeCorrect,
    reconstructionCorrect,
  ].filter(Boolean).length;

  const baseScore =
    (murdererCorrect ? 30 : 0) +
    (methodCorrect ? 18 : 0) +
    secondaryCorrectCount * 6 +
    Math.min(16, criticalEvidenceMatched * 3);

  // 1. UNSOLVED_CASE: Player attempts accusation with far too little evidence or blanks
  if (
    !submission.murdererId ||
    evidenceCount < 6 ||
    submission.decisiveEvidenceIds.length === 0
  ) {
    return {
      id: 'UNSOLVED_CASE',
      title: 'The Unsolved Case',
      subtitle: 'Case File Remanded — Insufficient Proof',
      verdictSummary:
        'Without sufficient physical evidence or corroborated testimony, Scotland Yard declined to issue a warrant. The storm cleared over Ashcroft Manor, leaving Sir Reginald’s locked-room death a whispered London enigma.',
      logicalBreakdown: [
        `Evidence gathered: ${evidenceCount} items (insufficient for Crown prosecution).`,
        'Critical locked-room and toxicology links remained unproven.',
      ],
      rankLabel: 'Inconclusive',
      score: Math.max(10, baseScore),
    };
  }

  // 2. FALSE_TRAIL: Player accused one of the intentional red-herring suspects (Edward or Evelyn)
  if (!murdererCorrect && sol.redHerringSuspectIds.includes(submission.murdererId)) {
    const accused =
      caseDef.suspects.find((s) => s.id === submission.murdererId)?.name ?? 'the suspect';
    return {
      id: 'FALSE_TRAIL',
      title: 'The False Trail',
      subtitle: 'Misled by Circumstance & Red Herrings',
      verdictSummary: `You built an impassioned case against ${accused} based on debts, burned paper, or muddy boots—precisely the distractions that concealed the true murderer. Dr. Arthur Pembroke quietly burned his last clinical ledger and walked free.`,
      logicalBreakdown: [
        `${accused} acted suspiciously to hide personal secrets, not murder.`,
        'The 2-minute Study clock lag and #4 surgical catgut mechanism pointed directly to Dr. Pembroke.',
      ],
      rankLabel: 'Misdirected',
      score: Math.max(25, baseScore),
    };
  }

  // 3. WRONG_ACCUSATION: Any other incorrect suspect
  if (!murdererCorrect) {
    const accused =
      caseDef.suspects.find((s) => s.id === submission.murdererId)?.name ?? 'an innocent party';
    return {
      id: 'WRONG_ACCUSATION',
      title: 'The Wrong Accusation',
      subtitle: 'Justice Miscarried at Ashcroft Manor',
      verdictSummary: `Upon presenting your charge against ${accused}, Inspector Harrow swiftly dismantled the timeline. The real killer escaped arrest in the confusion, leaving a stain upon your Baker Street reputation.`,
      logicalBreakdown: [
        `${accused} lacked both the poison expertise and the surgical catgut mechanism.`,
        'Re-examine Dr. Pembroke’s 11:24 PM clock claim against synchronized Westminster time.',
      ],
      rankLabel: 'Refuted',
      score: Math.max(18, baseScore),
    };
  }

  // Murderer IS Dr. Arthur Pembroke from here down!
  // 4. PARTIAL_TRUTH: Murderer correct, but method is wrong
  if (!methodCorrect) {
    return {
      id: 'PARTIAL_TRUTH',
      title: 'The Partial Truth',
      subtitle: 'Culprit Identified — Locked-Room Mechanism Unproven',
      verdictSummary:
        'You rightly named Dr. Arthur Pembroke as Sir Reginald’s killer, yet your explanation of how the oak door was bolted from inside failed under cross-examination. Pembroke’s counsel nearly secured an acquittal until Scotland Yard re-inspected the threshold rug.',
      logicalBreakdown: [
        'Murderer correctly identified: Dr. Arthur Pembroke.',
        'Missed method: #4 waxed surgical catgut drawn beneath the folded carpet to pull the inside brass thumb-bolt.',
      ],
      rankLabel: 'Partial Deduction',
      score: Math.min(82, baseScore + 5),
    };
  }

  // 5. HIDDEN_TRUTH: Everything solved cleanly PLUS discovered the concealed Thames smuggling legacy
  if (
    hiddenTruthUnlocked &&
    motiveCorrect &&
    secondaryCorrectCount >= 5 &&
    criticalEvidenceMatched >= 4
  ) {
    return {
      id: 'HIDDEN_TRUTH',
      title: 'The Hidden Truth',
      subtitle: 'Every Veil Lifted — Murder & Ancestral Secret Solved',
      verdictSummary:
        'Not only did you dismantle Dr. Arthur Pembroke’s surgical catgut trick and two-minute clock alibi with clinical precision—you also traced Thomas Ward’s hidden Library stair to the Ashcroft maritime smuggling ledgers beneath the Thames, laying bare every secret within the manor.',
      logicalBreakdown: [
        'Solved Dr. Pembroke’s aconite poisoning, falsified 11:28 PM watch, and catgut thumb-bolt trick.',
        'Exposed the 11:24 PM / 11:26 PM two-minute Study Mantel Clock trap.',
        'Uncovered the forgotten 18th-century Ashcroft smuggling passage to the Thames boathouse.',
      ],
      rankLabel: 'Grandmaster Consulting Detective',
      score: 100,
    };
  }

  // 6. MASTER_DETECTIVE: All key pillars solved cleanly
  if (
    motiveCorrect &&
    opportunityCorrect &&
    todCorrect &&
    falseStatementCorrect &&
    mistakeCorrect &&
    reconstructionCorrect &&
    criticalEvidenceMatched >= 4
  ) {
    return {
      id: 'MASTER_DETECTIVE',
      title: 'The Master Detective',
      subtitle: 'Irrefutable Case — Every Contradiction Proven',
      verdictSummary:
        'Inspector Harrow lowered his notebook in quiet admiration. Piece by piece—from the aconite tonic and scorched 11:26 PM telegraph ribbon to the two-minute clock error and singed surgical catgut—you left Dr. Arthur Pembroke no room for denial.',
      logicalBreakdown: [
        'Correct murderer, motive (Whitechapel trial fraud), and method (aconite + catgut thumb-bolt).',
        'Exact timeline reconstruction proving collapse occurred before 11:26 PM.',
        'Exposed Pembroke’s fatal two-minute clock oversight.',
      ],
      rankLabel: 'Master Consulting Detective',
      score: 96,
    };
  }

  // 7. BRILLIANT_DETECTIVE: Murderer and method right, some secondary details missed
  return {
    id: 'BRILLIANT_DETECTIVE',
    title: 'The Brilliant Detective',
    subtitle: 'Murderer Arrested — Minor Details Refined by Yard',
    verdictSummary:
      'You nailed Dr. Arthur Pembroke and exposed both the aconite poisoning and the surgical catgut locked-room mechanism. Scotland Yard secured an indictment, though a few secondary timeline or evidence links required Inspector Harrow’s follow-up.',
    logicalBreakdown: [
      'Correct murderer and locked-room method.',
      `Secondary deduction pillars matched: ${secondaryCorrectCount} of 6.`,
      `Critical decisive exhibits selected: ${criticalEvidenceMatched} of ${sol.requiredEvidenceIds.length}.`,
    ],
    rankLabel: 'Brilliant Investigator',
    score: Math.max(76, Math.min(91, baseScore)),
  };
}
