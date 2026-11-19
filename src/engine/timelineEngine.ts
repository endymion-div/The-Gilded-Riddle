import { CaseDefinition, TimelineEvent } from '../types/game';

export interface TimelineValidationResult {
  isExactChronologicalOrder: boolean;
  misplacedCount: number;
  totalVisible: number;
  feedback: string;
}

export function getDiscoveredTimelineEvents(
  discoveredTimelineIds: string[],
  playerOrder: string[],
  caseDef: CaseDefinition
): TimelineEvent[] {
  const byId = new Map(caseDef.timelineEvents.map((e) => [e.id, e]));
  const ordered: TimelineEvent[] = [];

  for (const id of playerOrder) {
    if (discoveredTimelineIds.includes(id)) {
      const ev = byId.get(id);
      if (ev) ordered.push(ev);
    }
  }

  for (const id of discoveredTimelineIds) {
    if (!playerOrder.includes(id)) {
      const ev = byId.get(id);
      if (ev) ordered.push(ev);
    }
  }

  return ordered;
}

export function reorderTimelineList(
  currentOrder: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= currentOrder.length ||
    toIndex >= currentOrder.length ||
    fromIndex === toIndex
  ) {
    return currentOrder;
  }
  const next = [...currentOrder];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function validateTimelineOrder(
  orderedIds: string[],
  caseDef: CaseDefinition
): TimelineValidationResult {
  const events = orderedIds
    .map((id) => caseDef.timelineEvents.find((e) => e.id === id))
    .filter((e): e is TimelineEvent => Boolean(e));

  if (events.length < 2) {
    return {
      isExactChronologicalOrder: true,
      misplacedCount: 0,
      totalVisible: events.length,
      feedback: 'Discover more timestamps to reconstruct the evening sequence.',
    };
  }

  const sortedIds = [...events]
    .sort((a, b) => a.chronologicalOrder - b.chronologicalOrder)
    .map((e) => e.id);

  let misplacedCount = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i].id !== sortedIds[i]) {
      misplacedCount++;
    }
  }

  if (misplacedCount === 0) {
    return {
      isExactChronologicalOrder: true,
      misplacedCount: 0,
      totalVisible: events.length,
      feedback:
        'Chronological sequence aligns cleanly with synchronized Westminster time and physical evidence.',
    };
  }

  return {
    isExactChronologicalOrder: false,
    misplacedCount,
    totalVisible: events.length,
    feedback: `${misplacedCount} event(s) sit out of sequence. Remember: the Study Mantel Clock lags 2 minutes behind real time, and the 11:28 PM watch was staged after the collapse.`,
  };
}
