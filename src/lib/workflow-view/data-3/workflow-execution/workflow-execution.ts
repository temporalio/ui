import {
  fetchExecutionDetails,
  fetchHistory,
  fetchLatestEvent,
  fetchStartEvent,
} from './api';
import { getWorkflowExecutionKeyFromIdentity } from './get-key-from-identity';
import type {
  ChildWorkflowExecutionReference,
  NotificationByTopic,
  Subscriber,
  SubscriptionArgs,
  SubscriptionTopic,
  WorkflowExecutionDetails,
  WorkflowExecutionIdentity,
  WorkflowExecutionKey,
  WorkflowExecutionNotification,
} from './types';
import { WorkflowExecutionChangeBatch } from './workflow-execution-change-batch';
import { EventGroupMarkerGroupsProjection } from '../event-group-markers/event-group-marker-groups-projection';
import { getEventGroupMarkerSource } from '../event-group-markers/get-event-group-marker-source';
import type {
  EventGroupMarkerDescriptor,
  EventGroupMarkerGroup,
  EventGroupMarkerKey,
  EventGroupMarkerSource,
} from '../event-group-markers/types';
import { assertDiscoveredStartEvent } from '../history-events/assert-discovered-start-event';
import { compareEventIds } from '../history-events/compare-event-ids';
import { getChildWorkflowExecutionReference } from '../history-events/get-child-workflow-execution-reference';
import { getNextExecutionIdentity } from '../history-events/get-next-execution-identity';
import { isTerminalExecutionEvent } from '../history-events/is-terminal-execution-event';
import type {
  DiscoveredStartEvent,
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import { LifecycleGroupsFilterIndexesProjection } from '../lifecycle-group-filter-indexes/lifecycle-group-filter-indexes-projection';
import type {
  LifecycleGroupFilterDefinition,
  LifecycleGroupFilterKey,
} from '../lifecycle-group-filter-indexes/types';
import { getLifecycleReference } from '../lifecycle-groups/get-lifecycle-reference';
import { LifecycleGroupsProjection } from '../lifecycle-groups/lifecycle-groups-projection';
import type { LifecycleGroup } from '../lifecycle-groups/types';
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
  private _executionDetails: WorkflowExecutionDetails | null = null;
  private _executionDetailsRequestSequence = 0;

  private _subscribersByTopic: {
    [T in SubscriptionTopic]: Set<Subscriber<T>>;
  } = {
    CHILD_EXECUTION_REFERENCES_ADDED: new Set(),
    EXECUTION_DETAILS_CHANGED: new Set(),
    LIFECYCLE_GROUP_FILTER_INDEXES_CHANGED: new Set(),
    EVENTS_ADDED: new Set(),
    LIFECYCLE_GROUPS_CHANGED: new Set(),
    EVENT_GROUP_MARKER_GROUPS_CHANGED: new Set(),
  };

  private _nextExecutionIdentity: WorkflowExecutionIdentity | null = null;

  private _lifecycleGroupsProjection = new LifecycleGroupsProjection();

  private _eventGroupMarkerGroupsProjection =
    new EventGroupMarkerGroupsProjection();

  private _lifecycleGroupFilterIndexesProjection: LifecycleGroupsFilterIndexesProjection;

  private _events = new Map<HistoryEventId, NormalizedHistoryEvent>();
  private _childExecutionReferences = new Map<
    HistoryEventId,
    ChildWorkflowExecutionReference
  >();

  /** Fetches the start event and constructs a discovered execution. */
  static async discover(
    identity: WorkflowExecutionIdentity,
    filterDefinitions: readonly LifecycleGroupFilterDefinition[] = [],
    signal?: AbortSignal,
  ): Promise<WorkflowExecution> {
    signal?.throwIfAborted();

    const startEvent = await fetchStartEvent(identity, signal);

    signal?.throwIfAborted();
    assertDiscoveredStartEvent(startEvent);

    return new WorkflowExecution(identity, startEvent, filterDefinitions);
  }

  private constructor(
    identity: WorkflowExecutionIdentity,
    startEvent: DiscoveredStartEvent,
    filterDefinitions: readonly LifecycleGroupFilterDefinition[],
  ) {
    this._lifecycleGroupFilterIndexesProjection =
      new LifecycleGroupsFilterIndexesProjection(filterDefinitions);
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

    this._ingestEvents([startEvent]);
  }

  private _notifySubscribers(
    notifications: readonly WorkflowExecutionNotification[],
  ): void {
    const notify = <T extends SubscriptionTopic>(
      topic: T,
      payload: NotificationByTopic[T],
    ) => {
      for (const subscriber of this._subscribersByTopic[topic]) {
        subscriber(payload);
      }
    };

    for (const notification of notifications) {
      notify(notification.topic, notification.payload);
    }
  }

  /** Ingests a batch, updates affected filter indexes, then notifies subscribers. */
  private _ingestEvents(events: readonly NormalizedHistoryEvent[]): void {
    const batch = new WorkflowExecutionChangeBatch();

    for (const event of events) {
      if (this._events.has(event.eventId)) {
        continue;
      }

      const childReference = getChildWorkflowExecutionReference(
        this.identity.namespace,
        event,
      );

      this._events.set(event.eventId, event);
      batch.add({ type: 'EVENT_ADDED', eventId: event.eventId });

      const nextIdentity = getNextExecutionIdentity(this.identity, event);

      if (nextIdentity) {
        this._nextExecutionIdentity = nextIdentity;
      }

      if (compareEventIds(event.eventId, this._latestEvent.eventId) > 0) {
        this._latestEvent = event;
      }

      const lifecycleReference = getLifecycleReference(event);
      const lifecycleGroupChange = this._lifecycleGroupsProjection.addEvent(
        event,
        lifecycleReference,
      );

      if (lifecycleGroupChange) {
        batch.add(lifecycleGroupChange);
      }
      if (
        childReference &&
        !this._childExecutionReferences.has(childReference.headEventId)
      ) {
        this._childExecutionReferences.set(
          childReference.headEventId,
          childReference,
        );
        batch.add({
          type: 'CHILD_EXECUTION_REFERENCE_ADDED',
          headEventId: childReference.headEventId,
        });
      }

      const eventGroupMarkerGroupChanges =
        this._eventGroupMarkerGroupsProjection.addEvent(
          event,
          lifecycleReference,
        );

      batch.addAll(eventGroupMarkerGroupChanges);
    }

    for (const headEventId of batch.changedLifecycleHeadEventIds) {
      const group =
        this._lifecycleGroupsProjection.lifecycleGroups.get(headEventId);
      if (!group) {
        throw new Error(`Missing lifecycle group ${headEventId}`);
      }

      const filterChanges =
        this._lifecycleGroupFilterIndexesProjection.updateGroup(
          group,
          (eventId) => this.getEvent(eventId),
          this._executionDetails,
        );

      batch.addAll(filterChanges);
    }

    this._notifySubscribers(batch.notifications);
  }

  /** Refreshes details; only the most recently started request may replace the snapshot. */
  async loadExecutionDetails(signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();

    const sequence = ++this._executionDetailsRequestSequence;
    const details = await fetchExecutionDetails(this.identity, signal);

    signal?.throwIfAborted();
    if (sequence !== this._executionDetailsRequestSequence) {
      return;
    }

    this._executionDetails = details;

    const filterChanges =
      this._lifecycleGroupFilterIndexesProjection.updateExecutionDetails(
        this._lifecycleGroupsProjection.lifecycleGroups.values(),
        (eventId) => this.getEvent(eventId),
        details,
      );

    const batch = new WorkflowExecutionChangeBatch();
    batch.addAll(filterChanges);
    this._notifySubscribers(batch.notifications);

    for (const subscriber of this._subscribersByTopic
      .EXECUTION_DETAILS_CHANGED) {
      subscriber({ details });
    }
  }

  /** Returns the last successful details snapshot, or null before the first load. */
  get executionDetails(): WorkflowExecutionDetails | null {
    return this._executionDetails;
  }

  /** Loads history, retaining previously stored events. */
  async loadHistory(signal?: AbortSignal): Promise<void> {
    await fetchHistory(
      this.identity,
      (events) => {
        this._ingestEvents(events);
      },
      signal,
    );
  }

  /** Fetches and ingests the latest recorded history event. */
  async loadLatestEvent(signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();

    const event = await fetchLatestEvent(this.identity, signal);

    signal?.throwIfAborted();
    this._ingestEvents([event]);
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

  /** Returns known started children keyed by their parent lifecycle head event ID. */
  get childExecutionReferences(): ReadonlyMap<
    HistoryEventId,
    ChildWorkflowExecutionReference
  > {
    return this._childExecutionReferences;
  }

  /** Returns map of the lifecycle groups by headEventId */
  get lifecycleGroups(): ReadonlyMap<HistoryEventId, LifecycleGroup> {
    return this._lifecycleGroupsProjection.lifecycleGroups;
  }

  /** Returns a live readonly view of groups keyed by marker identity. */
  get eventGroupMarkerGroups(): ReadonlyMap<
    EventGroupMarkerKey,
    EventGroupMarkerGroup
  > {
    return this._eventGroupMarkerGroupsProjection.eventGroupMarkerGroups;
  }

  /** Returns a live readonly view of matching lifecycle head IDs by filter. */
  get lifecycleGroupFilterIndexes(): ReadonlyMap<
    LifecycleGroupFilterKey,
    ReadonlySet<HistoryEventId>
  > {
    return this._lifecycleGroupFilterIndexesProjection.filterIndex;
  }

  /** Resolves marker source metadata from currently known history, without caching a copy. */
  getEventGroupMarkerSource(
    marker: EventGroupMarkerDescriptor,
  ): EventGroupMarkerSource | null {
    return getEventGroupMarkerSource(
      marker,
      (eventId) => this.getEvent(eventId),
      marker.type === 'inbound-update'
        ? this._eventGroupMarkerGroupsProjection.updateSourceEventIds.get(
            marker.updateId,
          )
        : undefined,
    );
  }

  /** Returns a stored event by its ID within this execution. */
  getEvent(eventId: HistoryEventId): NormalizedHistoryEvent | undefined {
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
      case 'CHILD_EXECUTION_REFERENCES_ADDED': {
        return subscribeTo(
          this._subscribersByTopic.CHILD_EXECUTION_REFERENCES_ADDED,
          handler,
        );
      }
      case 'EXECUTION_DETAILS_CHANGED': {
        return subscribeTo(
          this._subscribersByTopic.EXECUTION_DETAILS_CHANGED,
          handler,
        );
      }
      case 'LIFECYCLE_GROUP_FILTER_INDEXES_CHANGED': {
        return subscribeTo(
          this._subscribersByTopic.LIFECYCLE_GROUP_FILTER_INDEXES_CHANGED,
          handler,
        );
      }
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
