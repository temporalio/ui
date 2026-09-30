import type { EventKey, ExecutionKey } from '../identity-keys';
import { toQualifiedHistoryEvent } from './qualify-history-event';
import type {
  HistoryEventRepositoryNotification,
  HistoryEventRepositorySubscriber,
  NormalizedHistoryEvent,
  QualifiedHistoryEvent,
} from './types';

/** Stores canonical history events and publishes repository notifications. */
export class HistoryEventRepository {
  private _qualifiedEventsByKey = new Map<EventKey, QualifiedHistoryEvent>();
  private _subscribers = new Set<HistoryEventRepositorySubscriber>();

  /** Cached point-in-time event snapshot shared until repository state changes. */
  private _eventSnapshotCache: readonly QualifiedHistoryEvent[] | null = null;

  /** Returns a history event by its execution-qualified key. */
  getEvent(eventKey: EventKey): QualifiedHistoryEvent | undefined {
    return this._qualifiedEventsByKey.get(eventKey);
  }

  /** Returns the current cached point-in-time event snapshot. */
  getSnapshot(): readonly QualifiedHistoryEvent[] {
    if (this._eventSnapshotCache) {
      return this._eventSnapshotCache;
    }

    this._eventSnapshotCache = [...this._qualifiedEventsByKey.values()];
    return this._eventSnapshotCache;
  }

  /** Add event to internal state, does not notify subscribers.
   *  @returns the QualifiedHistoryEvent if it was not already in repository state, otherwise null.
   */
  private _addEvent(
    executionKey: ExecutionKey,
    event: NormalizedHistoryEvent,
  ): QualifiedHistoryEvent | null {
    const qualifiedHistoryEvent = toQualifiedHistoryEvent(executionKey, event);

    if (this._qualifiedEventsByKey.has(qualifiedHistoryEvent.eventKey)) {
      return null;
    }

    this._qualifiedEventsByKey.set(
      qualifiedHistoryEvent.eventKey,
      qualifiedHistoryEvent,
    );
    this._eventSnapshotCache = null;

    return qualifiedHistoryEvent;
  }

  private _notifySubscribers(
    notification: HistoryEventRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }

  /**
   * Subscribe to history event repository notifications.
   * @param options.emitCurrentSnapshot Emit the current event snapshot immediately after subscribing.
   * @returns Unsubscribe function.
   */
  subscribe(
    subscriber: HistoryEventRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'HISTORY_EVENTS_SNAPSHOT',
        events: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Adds a batch of events and returns the events not already in the repository. */
  addEvents(
    executionKey: ExecutionKey,
    events: readonly NormalizedHistoryEvent[],
  ): readonly QualifiedHistoryEvent[] {
    const addedQualifiedEvents: QualifiedHistoryEvent[] = [];

    for (const historyEvent of events) {
      const qualifiedHistoryEvent = this._addEvent(executionKey, historyEvent);

      if (qualifiedHistoryEvent) {
        addedQualifiedEvents.push(qualifiedHistoryEvent);
      }
    }

    if (addedQualifiedEvents.length) {
      this._notifySubscribers({
        type: 'HISTORY_EVENTS_ADDED',
        executionKey,
        events: addedQualifiedEvents,
      });
    }

    return addedQualifiedEvents;
  }
}
