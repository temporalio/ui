import type { QualifiedHistoryEvent } from '../history-events/types';
import type {
  EventKey,
  LifecycleFilterKey,
  LifecycleKey,
} from '../identity-keys';
import type { LifecycleGroup } from '../lifecycle-groups/types';

/** Resolves an execution-qualified history event. */
export type LifecycleFilterEventLookup = (
  eventKey: EventKey,
) => QualifiedHistoryEvent | undefined;

/** A named predicate evaluated when lifecycle groups change. */
export type LifecycleFilterDefinition = Readonly<{
  key: LifecycleFilterKey;
  matches: (
    group: LifecycleGroup,
    getEvent: LifecycleFilterEventLookup,
  ) => boolean;
}>;

/** Combines positive filters; empty combinations select nothing. */
export type LifecycleFilterQuery =
  | Readonly<{ type: 'filter'; key: LifecycleFilterKey }>
  | Readonly<{ type: 'all' | 'any'; queries: readonly LifecycleFilterQuery[] }>;

/** Receives point-in-time query membership snapshots. */
export type LifecycleFilterQuerySubscriber = (
  lifecycleKeys: readonly LifecycleKey[],
) => void;
