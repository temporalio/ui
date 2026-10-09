import { getLifecycleReference } from './get-lifecycle-reference';
import type {
  LifecycleGroup,
  LifecycleGroupMutable,
  LifecycleGroupsProjectionChange,
  LifecycleReference,
} from './types';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';

export class LifecycleGroupsProjection {
  private _lifecycleGroups = new Map<HistoryEventId, LifecycleGroupMutable>();

  /** Adds an event to its lifecycle, returning null if membership is unchanged. */
  addEvent(
    event: NormalizedHistoryEvent,
    reference: LifecycleReference = getLifecycleReference(event),
  ): LifecycleGroupsProjectionChange | null {
    const existing = this._lifecycleGroups.get(reference.headEventId);

    if (existing?.eventIds.has(event.eventId)) {
      return null;
    }

    if (existing) {
      existing.eventIds.add(event.eventId);
      existing.revision += 1;
    } else {
      this._lifecycleGroups.set(reference.headEventId, {
        ...reference,
        revision: 1,
        eventIds: new Set([event.eventId]),
      });
    }

    return {
      type: 'LIFECYCLE_GROUP_CHANGED',
      headEventId: reference.headEventId,
    };
  }

  /** Returns a live readonly view of lifecycle groups keyed by head event ID. */
  get lifecycleGroups(): ReadonlyMap<HistoryEventId, LifecycleGroup> {
    return this._lifecycleGroups;
  }
}
