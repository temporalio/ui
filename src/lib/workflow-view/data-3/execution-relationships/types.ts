import type { HistoryEventId } from '../history-events/types';

/** Reports a newly registered child execution association. */
export type ExecutionRelationshipsProjectionChange = Readonly<{
  type: 'CHILD_EXECUTION_ASSOCIATION_ADDED';
  headEventId: HistoryEventId;
}>;
