import { fetchHistory, fetchLatestEvent, fetchStartEvent } from './api';
import { getWorkflowExecutionKeyFromIdentity } from './get-key-from-identity';
import type {
  NotificationByTopic,
  Subscriber,
  SubscriptionArgs,
  SubscriptionTopic,
  WorkflowExecutionChange,
  WorkflowExecutionIdentity,
  WorkflowExecutionKey,
} from './types';
import { getEventGroupMarkerReferences } from '../event-group-markers/get-event-group-marker-references';
import type {
  EventGroupMarkerGroup,
  EventGroupMarkerGroupMutable,
  EventGroupMarkerKey,
} from '../event-group-markers/types';
import { assertDiscoveredStartEvent } from '../history-events/assert-discovered-start-event';
import { compareEventIds } from '../history-events/compare-event-ids';
import { getNextExecutionIdentity } from '../history-events/get-next-execution-identity';
import { isTerminalExecutionEvent } from '../history-events/is-terminal-execution-event';
import type {
  DiscoveredStartEvent,
  NormalizedHistoryEvent,
} from '../history-events/types';
import { getLifecycleReference } from '../lifecycle-groups/get-lifecycle-reference';
import type {
  LifecycleGroup,
  LifecycleGroupMutable,
} from '../lifecycle-groups/types';
import type { WorkflowExecutionChainIdentity } from '../workflow-execution-chain/types';

export class WorkflowExecution {
  readonly key: WorkflowExecutionKey;
  readonly identity: WorkflowExecutionIdentity;
  /** Identifies the chain established by the validated start event. */
  readonly executionChainIdentity: WorkflowExecutionChainIdentity;
  /** Identifies the preceding execution, if reported by the start event. */
  readonly previousExecutionIdentity: WorkflowExecutionIdentity | null;
  readonly startEvent: DiscoveredStartEvent;
  private _latestEvent: NormalizedHistoryEvent;

  private _subscribersByTopic: {
    [T in SubscriptionTopic]: Set<Subscriber<T>>;
  } = {
    EVENTS_ADDED: new Set(),
    LIFECYCLE_GROUPS_CHANGED: new Set(),
    EVENT_GROUP_MARKER_GROUPS_CHANGED: new Set(),
  };

  private _nextExecutionIdentity: WorkflowExecutionIdentity | null = null;

  private _lifecycleGroups = new Map<string, LifecycleGroupMutable>();

  private _eventGroupMarkerGroups = new Map<
    EventGroupMarkerKey,
    EventGroupMarkerGroupMutable
  >();

  private _events = new Map<string, NormalizedHistoryEvent>();

  /** Fetches the start event and constructs a discovered execution. */
  static async discover(
    identity: WorkflowExecutionIdentity,
    signal?: AbortSignal,
  ): Promise<WorkflowExecution> {
    signal?.throwIfAborted();

    const startEvent = await fetchStartEvent(identity, signal);

    signal?.throwIfAborted();
    assertDiscoveredStartEvent(startEvent);

    return new WorkflowExecution(identity, startEvent);
  }

  private constructor(
    identity: WorkflowExecutionIdentity,
    startEvent: DiscoveredStartEvent,
  ) {
    this.startEvent = startEvent;
    this._latestEvent = startEvent;

    this.key = getWorkflowExecutionKeyFromIdentity(identity);
    this.identity = identity;

    this.executionChainIdentity = {
      namespace: identity.namespace,
      workflowId: identity.workflowId,
      firstRunId:
        startEvent.workflowExecutionStartedEventAttributes.firstExecutionRunId,
    };

    const previousRunId =
      startEvent.workflowExecutionStartedEventAttributes
        .continuedExecutionRunId;

    this.previousExecutionIdentity = previousRunId
      ? {
          namespace: identity.namespace,
          workflowId: identity.workflowId,
          runId: previousRunId,
        }
      : null;

    // calling _addEvent to ensure startEvent is "ingested"
    this._addEvent(startEvent);
  }

  private _notifySubscribers(
    changes: readonly WorkflowExecutionChange[],
  ): void {
    const eventIds = new Set<string>();
    const headEventIds = new Set<string>();
    const eventGroupMarkerKeys = new Set<EventGroupMarkerKey>();

    for (const change of changes) {
      switch (change.type) {
        case 'EVENT_ADDED': {
          eventIds.add(change.eventId);
          break;
        }

        case 'LIFECYCLE_GROUP_CHANGED': {
          headEventIds.add(change.headEventId);
          break;
        }

        case 'EVENT_GROUP_MARKER_GROUP_CHANGED': {
          eventGroupMarkerKeys.add(change.eventGroupMarkerKey);
          break;
        }
      }
    }

    if (eventIds.size) {
      const notification: NotificationByTopic['EVENTS_ADDED'] = {
        eventIds: Array.from(eventIds),
      };

      for (const subscriber of this._subscribersByTopic.EVENTS_ADDED) {
        subscriber(notification);
      }
    }

    if (headEventIds.size) {
      const notification: NotificationByTopic['LIFECYCLE_GROUPS_CHANGED'] = {
        headEventIds: Array.from(headEventIds),
      };

      for (const subscriber of this._subscribersByTopic
        .LIFECYCLE_GROUPS_CHANGED) {
        subscriber(notification);
      }
    }

    if (eventGroupMarkerKeys.size) {
      const notification: NotificationByTopic['EVENT_GROUP_MARKER_GROUPS_CHANGED'] =
        {
          eventGroupMarkerKeys: Array.from(eventGroupMarkerKeys),
        };

      for (const subscriber of this._subscribersByTopic
        .EVENT_GROUP_MARKER_GROUPS_CHANGED) {
        subscriber(notification);
      }
    }
  }

  /** Adds an event if one with the same eventId isn't already present. */
  private _addEvent(
    event: NormalizedHistoryEvent,
  ): readonly WorkflowExecutionChange[] {
    if (this._events.has(event.eventId)) {
      return [];
    }

    const changes: WorkflowExecutionChange[] = [];

    this._events.set(event.eventId, event);
    changes.push({ type: 'EVENT_ADDED', eventId: event.eventId });

    // Discover next execution if it exists

    const nextIdentity = getNextExecutionIdentity(this.identity, event);

    if (nextIdentity) {
      this._nextExecutionIdentity = nextIdentity;
    }

    // Ensure _latestEvent actually points to the latest event

    if (compareEventIds(event.eventId, this._latestEvent.eventId) > 0) {
      this._latestEvent = event;
    }

    // Lifecycle grouping

    const lifecycleReference = getLifecycleReference(event);
    const existingLifecycleGroup = this._lifecycleGroups.get(
      lifecycleReference.headEventId,
    );
    let lifecycleChanged = false;

    if (existingLifecycleGroup) {
      const prevSize = existingLifecycleGroup.eventIds.size;

      existingLifecycleGroup.eventIds.add(event.eventId);

      const nextSize = existingLifecycleGroup.eventIds.size;
      existingLifecycleGroup.revision = nextSize;

      lifecycleChanged = prevSize !== nextSize;
    } else {
      this._lifecycleGroups.set(lifecycleReference.headEventId, {
        ...lifecycleReference,
        revision: 1,
        eventIds: new Set([event.eventId]),
      });
      lifecycleChanged = true;
    }

    if (lifecycleChanged) {
      changes.push({
        type: 'LIFECYCLE_GROUP_CHANGED',
        headEventId: lifecycleReference.headEventId,
      });
    }

    // Event group marker grouping
    for (const eventGroupMarkerReference of getEventGroupMarkerReferences(
      event,
    )) {
      const existingMarkerGroup = this._eventGroupMarkerGroups.get(
        eventGroupMarkerReference.key,
      );

      let eventMarkerGroupChanged = false;

      if (existingMarkerGroup) {
        const previousEventCount = existingMarkerGroup.eventIds.size;
        const previousLifecycleCount =
          existingMarkerGroup.lifecycleHeadEventIds.size;

        existingMarkerGroup.eventIds.add(event.eventId);
        existingMarkerGroup.lifecycleHeadEventIds.add(
          lifecycleReference.headEventId,
        );

        eventMarkerGroupChanged =
          existingMarkerGroup.eventIds.size !== previousEventCount ||
          existingMarkerGroup.lifecycleHeadEventIds.size !==
            previousLifecycleCount;

        if (
          !existingMarkerGroup.marker.label?.label &&
          eventGroupMarkerReference.marker.label?.label
        ) {
          existingMarkerGroup.marker = eventGroupMarkerReference.marker;
          eventMarkerGroupChanged = true;
        }

        if (eventMarkerGroupChanged) {
          existingMarkerGroup.revision += 1;
        }
      } else {
        this._eventGroupMarkerGroups.set(eventGroupMarkerReference.key, {
          identity: eventGroupMarkerReference.identity,
          marker: eventGroupMarkerReference.marker,
          eventIds: new Set([event.eventId]),
          lifecycleHeadEventIds: new Set([lifecycleReference.headEventId]),
          revision: 1,
        });

        eventMarkerGroupChanged = true;
      }

      if (eventMarkerGroupChanged) {
        changes.push({
          type: 'EVENT_GROUP_MARKER_GROUP_CHANGED',
          eventGroupMarkerKey: eventGroupMarkerReference.key,
        });
      }
    }

    return changes;
  }

  /** Adds batch of events and notifies history subscribers on change */
  private _addEventsAndNotify(events: readonly NormalizedHistoryEvent[]): void {
    const batchChanges: WorkflowExecutionChange[] = [];

    for (const event of events) {
      const changes = this._addEvent(event);
      batchChanges.push(...changes);
    }

    if (batchChanges.length) {
      this._notifySubscribers(batchChanges);
    }
  }

  /** Loads history, retaining previously stored events. */
  async loadHistory(signal?: AbortSignal): Promise<void> {
    await fetchHistory(
      this.identity,
      (events) => {
        this._addEventsAndNotify(events);
      },
      signal,
    );
  }

  /** Fetches and ingests the latest recorded history event. */
  async loadLatestEvent(signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();

    const event = await fetchLatestEvent(this.identity, signal);

    signal?.throwIfAborted();
    this._addEventsAndNotify([event]);
  }

  /** Returns the latest event known to this execution. */
  get latestEvent(): NormalizedHistoryEvent {
    return this._latestEvent;
  }

  /** Whether a closing event has been observed. */
  get isTerminal(): boolean {
    return isTerminalExecutionEvent(this._latestEvent.eventType);
  }

  /** Returns the reported successor, or null if none has been discovered. */
  get nextExecutionIdentity(): WorkflowExecutionIdentity | null {
    return this._nextExecutionIdentity;
  }

  /** Returns map of the lifecycle groups by headEventId */
  get lifecycleGroups(): ReadonlyMap<string, LifecycleGroup> {
    return this._lifecycleGroups;
  }

  /** Returns a live readonly view of groups keyed by marker identity. */
  get eventGroupMarkerGroups(): ReadonlyMap<
    EventGroupMarkerKey,
    EventGroupMarkerGroup
  > {
    return this._eventGroupMarkerGroups;
  }

  /** Returns a stored event by its ID within this execution. */
  getEvent(
    eventId: NormalizedHistoryEvent['eventId'],
  ): NormalizedHistoryEvent | undefined {
    return this._events.get(eventId);
  }

  /** Observes consolidated batch notifications for one topic; returns unsubscribe. */
  subscribe(...[topic, handler]: SubscriptionArgs): () => void {
    function subscribeTo<T>(subscribers: Set<T>, subscriber: T): () => void {
      subscribers.add(subscriber);

      return () => {
        subscribers.delete(subscriber);
      };
    }

    switch (topic) {
      case 'EVENTS_ADDED': {
        return subscribeTo(this._subscribersByTopic.EVENTS_ADDED, handler);
      }

      case 'LIFECYCLE_GROUPS_CHANGED': {
        return subscribeTo(
          this._subscribersByTopic.LIFECYCLE_GROUPS_CHANGED,
          handler,
        );
      }

      case 'EVENT_GROUP_MARKER_GROUPS_CHANGED': {
        return subscribeTo(
          this._subscribersByTopic.EVENT_GROUP_MARKER_GROUPS_CHANGED,
          handler,
        );
      }
    }
  }
}
