import type { EventGroupMarker as HttpEventGroupMarker } from '$lib/types/events';

import type {
  EventKey,
  EventMarkerGroupKey,
  ExecutionKey,
  LifecycleKey,
} from '../identity-keys';

/** An explicit label or implicit signal/update marker. */
export type EventGroupMarker = HttpEventGroupMarker;

/** A mutable marker-group working copy for batch updates. */
export type MutableEventMarkerGroup = {
  markerGroupKey: EventMarkerGroupKey;
  executionKey: ExecutionKey;
  marker: EventGroupMarker;
  eventKeys: Set<EventKey>;
  lifecycleKeys: Set<LifecycleKey>;
};

/** Directly marked events and their containing lifecycles. */
export type EventMarkerGroup = Readonly<
  Omit<MutableEventMarkerGroup, 'eventKeys' | 'lifecycleKeys'> & {
    eventKeys: ReadonlySet<EventKey>;
    lifecycleKeys: ReadonlySet<LifecycleKey>;
  }
>;

/** Publishes marker groups added or replaced. */
export type EventMarkerGroupsUpsertedNotification = Readonly<{
  type: 'EVENT_MARKER_GROUPS_UPSERTED';
  groups: readonly EventMarkerGroup[];
}>;

/** Publishes the current marker groups. */
export type EventMarkerGroupsSnapshotNotification = Readonly<{
  type: 'EVENT_MARKER_GROUPS_SNAPSHOT';
  groups: readonly EventMarkerGroup[];
}>;

/** A marker-group repository notification. */
export type EventMarkerGroupRepositoryNotification =
  | EventMarkerGroupsUpsertedNotification
  | EventMarkerGroupsSnapshotNotification;

/** Receives marker-group repository notifications. */
export type EventMarkerGroupRepositorySubscriber = (
  notification: EventMarkerGroupRepositoryNotification,
) => void;
