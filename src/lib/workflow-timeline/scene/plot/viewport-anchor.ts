import { type TimeRange, timeToX } from './time-viewport';
import type { ExecutionHistoryState } from '../../data/execution-history/types';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';

export function getInitialViewport(
  historyEvents: readonly QualifiedHistoryEvent[],
  executionHistories: readonly ExecutionHistoryState[],
): TimeRange | null {
  const history = executionHistories[0];
  if (!history) return null;

  const { status, progress } = history.load;
  const ready =
    status === 'loaded' ||
    status === 'failed' ||
    (progress !== null && progress.ascPages > 0 && progress.descPages > 0);
  if (!ready) return null;

  let startMs = Infinity;
  let endMs = -Infinity;

  for (const event of historyEvents) {
    if (
      event.executionKey !== history.executionKey ||
      !Number.isFinite(event.eventTimeMs)
    ) {
      continue;
    }

    startMs = Math.min(startMs, event.eventTimeMs);
    endMs = Math.max(endMs, event.eventTimeMs);
  }

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  if (endMs === startMs && status !== 'loaded' && status !== 'failed')
    return null;
  return { startMs, endMs: Math.max(startMs + 1, endMs) };
}

export function getViewportScrollLeft(
  startMs: number,
  domain: TimeRange,
  contentWidth: number,
): number {
  return Math.max(0, timeToX(startMs, domain, contentWidth));
}

export function getViewportStartMs(
  scrollLeft: number,
  domain: TimeRange,
  contentWidth: number,
): number {
  return (
    domain.startMs +
    (scrollLeft / contentWidth) * (domain.endMs - domain.startMs)
  );
}
