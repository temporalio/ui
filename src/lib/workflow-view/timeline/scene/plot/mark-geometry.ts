import type { QualifiedHistoryEvent } from '../../../data/history-events/types';

type MarkEvent = { x: number; eventType: QualifiedHistoryEvent['eventType'] };
type MarkTick = MarkEvent & { count: number; isOutcome: boolean };

export type MarkBounds = { left: number; right: number };

function getEventPriority(eventType: MarkEvent['eventType']): number {
  if (/(Failed|Terminated|TimedOut)$/.test(eventType)) return 3;
  if (eventType.endsWith('Canceled')) return 2;
  if (/(Completed|Fired|ContinuedAsNew)$/.test(eventType)) return 1;
  return 0;
}

export function getMarkGeometry(
  left: number,
  right: number,
  events: readonly MarkEvent[],
  { clusterDistance = 2, radius = 1 } = {},
): { bounds: MarkBounds; ticks: readonly MarkTick[] } {
  const ticks: MarkTick[] = [];
  let clusterStart = 0;
  let clusterPriority = 0;

  for (const event of events) {
    const priority = getEventPriority(event.eventType);
    const previous = ticks.at(-1);

    if (!previous || event.x - clusterStart > clusterDistance) {
      clusterStart = event.x;
      clusterPriority = priority;
      ticks.push({ ...event, count: 1, isOutcome: priority > 0 });
      continue;
    }

    previous.count += 1;
    if (priority >= clusterPriority) {
      previous.x = event.x;
      previous.eventType = event.eventType;
      previous.isOutcome = priority > 0;
      clusterPriority = priority;
    }
  }

  const bounds = { left, right };
  for (const tick of ticks) {
    bounds.left = Math.min(bounds.left, tick.x - radius);
    bounds.right = Math.max(bounds.right, tick.x + radius);
  }

  return { bounds, ticks };
}
