import type { NormalizedHistoryEvent, QualifiedHistoryEvent } from './types';
import { type ExecutionKey, getEventKey } from '../identity-keys';

/** Adds stable execution and event keys to a normalized history event. */
export function toQualifiedHistoryEvent(
  executionKey: ExecutionKey,
  historyEvent: NormalizedHistoryEvent,
): QualifiedHistoryEvent {
  return {
    ...historyEvent,
    executionKey,
    eventKey: getEventKey(executionKey, historyEvent.eventId),
  };
}
