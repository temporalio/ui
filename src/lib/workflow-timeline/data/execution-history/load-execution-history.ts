import { fetchExecutionHistory } from './fetch-execution-history';
import type {
  ExecutionHistoryLoadProgress,
  ExecutionHistoryLoadStats,
} from './types';
import { normalizeHistoryEvent } from '../history-events/normalize-history-event';
import { type HistoryEventRepository } from '../history-events/repository';
import { type ExecutionIdentity, getExecutionKey } from '../identity-keys';

/** Options for loading one workflow execution into a history event repository. */
export type LoadExecutionHistoryOptions = Readonly<{
  identity: ExecutionIdentity;
  historyEvents: HistoryEventRepository;
  signal?: AbortSignal;
  onProgress?: (progress: ExecutionHistoryLoadProgress) => void;
}>;

/** Loads one workflow execution and ingests each fetched page as it arrives. */
export function loadExecutionHistory({
  identity,
  historyEvents,
  signal,
  onProgress,
}: LoadExecutionHistoryOptions): Promise<ExecutionHistoryLoadStats> {
  const executionKey = getExecutionKey(identity);

  return fetchExecutionHistory({
    identity,
    signal,
    onProgress,
    onPage: (events) =>
      historyEvents.addEvents(executionKey, events.map(normalizeHistoryEvent))
        .length,
  });
}
