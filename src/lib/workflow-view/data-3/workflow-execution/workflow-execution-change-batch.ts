import type {
  WorkflowExecutionChange,
  WorkflowExecutionNotification,
} from './types';
import type { EventGroupMarkerKey } from '../event-group-markers/types';
import type { HistoryEventId } from '../history-events/types';
import type { LifecycleGroupFilterKey } from '../lifecycle-group-filter-indexes/types';

/** Collects domain changes into deduplicated notification payloads for one batch. */
export class WorkflowExecutionChangeBatch {
  private _eventIds = new Set<HistoryEventId>();
  private _lifecycleHeadEventIds = new Set<HistoryEventId>();
  private _childExecutionHeadEventIds = new Set<HistoryEventId>();
  private _markerKeys = new Set<EventGroupMarkerKey>();
  private _filterKeys = new Set<LifecycleGroupFilterKey>();

  /** Accumulates an individual change without retaining duplicate IDs. */
  add(change: WorkflowExecutionChange): void {
    switch (change.type) {
      case 'EVENT_ADDED':
        this._eventIds.add(change.eventId);
        break;

      case 'LIFECYCLE_GROUP_CHANGED':
        this._lifecycleHeadEventIds.add(change.headEventId);
        break;

      case 'CHILD_EXECUTION_REFERENCE_ADDED':
        this._childExecutionHeadEventIds.add(change.headEventId);
        break;

      case 'EVENT_GROUP_MARKER_GROUP_CHANGED':
        this._markerKeys.add(change.eventGroupMarkerKey);
        break;

      case 'LIFECYCLE_GROUP_FILTER_INDEX_CHANGED':
        this._filterKeys.add(change.lifecycleGroupFilterKey);
        break;
    }
  }

  /** Accumulates projection changes; null represents a projection with no changes. */
  addAll(changes: readonly WorkflowExecutionChange[] | null): void {
    if (!changes) {
      return;
    }

    for (const change of changes) {
      this.add(change);
    }
  }

  /** Returns the affected lifecycles to evaluate before publishing notifications. */
  get changedLifecycleHeadEventIds(): ReadonlySet<HistoryEventId> {
    return this._lifecycleHeadEventIds;
  }

  /** Creates point-in-time payloads only for topics that changed. */
  get notifications(): readonly WorkflowExecutionNotification[] {
    const notifications: WorkflowExecutionNotification[] = [];

    if (this._childExecutionHeadEventIds.size) {
      notifications.push({
        topic: 'CHILD_EXECUTION_REFERENCES_ADDED',
        payload: { headEventIds: Array.from(this._childExecutionHeadEventIds) },
      });
    }

    if (this._filterKeys.size) {
      notifications.push({
        topic: 'LIFECYCLE_GROUP_FILTER_INDEXES_CHANGED',
        payload: { lifecycleGroupFilterKeys: Array.from(this._filterKeys) },
      });
    }

    if (this._eventIds.size) {
      notifications.push({
        topic: 'EVENTS_ADDED',
        payload: { eventIds: Array.from(this._eventIds) },
      });
    }

    if (this._lifecycleHeadEventIds.size) {
      notifications.push({
        topic: 'LIFECYCLE_GROUPS_CHANGED',
        payload: { headEventIds: Array.from(this._lifecycleHeadEventIds) },
      });
    }

    if (this._markerKeys.size) {
      notifications.push({
        topic: 'EVENT_GROUP_MARKER_GROUPS_CHANGED',
        payload: { eventGroupMarkerKeys: Array.from(this._markerKeys) },
      });
    }

    return notifications;
  }
}
