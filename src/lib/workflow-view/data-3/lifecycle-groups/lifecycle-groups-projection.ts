import { getLifecycleIdentity } from './get-lifecycle-identity';
import { getTerminalOutcome, isPendingLifecycleEvent } from './lifecycle-state';
import type {
  LifecycleGroup,
  LifecycleGroupMutable,
  LifecycleGroupsProjectionChange,
  LifecycleIdentity,
} from './types';
import { compareEventIds } from '../history-events/compare-event-ids';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';

export class LifecycleGroupsProjection {
  private _lifecycleGroups = new Map<HistoryEventId, LifecycleGroupMutable>();

  /** Adds an event and updates lifecycle facts before reporting a group change. */
  addEvent(
    event: NormalizedHistoryEvent,
    identity: LifecycleIdentity = getLifecycleIdentity(event),
  ): LifecycleGroupsProjectionChange | null {
    const existing = this._lifecycleGroups.get(identity.headEventId);

    if (existing?.eventIds.has(event.eventId)) {
      return null;
    }

    const group: LifecycleGroupMutable = existing ?? {
      ...identity,
      revision: 0,
      eventIds: new Set(),
      hasPendingEvent: false,
      terminalEventId: null,
      terminalOutcome: null,
      activityId: null,
    };

    if (!existing) {
      this._lifecycleGroups.set(identity.headEventId, group);
    }

    group.eventIds.add(event.eventId);

    if (isPendingLifecycleEvent(event)) {
      group.hasPendingEvent = true;
    }

    if (event.eventType === 'ActivityTaskScheduled') {
      group.activityId =
        event.activityTaskScheduledEventAttributes?.activityId ?? null;
    }

    const terminalOutcome = getTerminalOutcome(event);

    if (
      terminalOutcome &&
      (!group.terminalEventId ||
        compareEventIds(event.eventId, group.terminalEventId) > 0)
    ) {
      group.terminalEventId = event.eventId;
      group.terminalOutcome = terminalOutcome;
    }

    group.revision += 1;

    return {
      type: 'LIFECYCLE_GROUP_CHANGED',
      headEventId: identity.headEventId,
    };
  }

  /** Returns a live readonly view of lifecycle groups keyed by head event ID. */
  get lifecycleGroups(): ReadonlyMap<HistoryEventId, LifecycleGroup> {
    return this._lifecycleGroups;
  }
}
