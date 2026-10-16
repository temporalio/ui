import type { EventGroupMarker } from '$lib/types/events';

import type { HistoryEventId } from '../history-events/types';

/** Identifies a marker within one execution. */
export type EventGroupMarkerIdentity = Readonly<{
  type: 'label' | 'inbound-event' | 'inbound-update';
  id: string;
}>;

export type EventGroupMarkerKey = `event-group-marker:(${string})`;

export type EventGroupMarkerReference = Readonly<{
  key: EventGroupMarkerKey;
  identity: EventGroupMarkerIdentity;
  marker: EventGroupMarker;
}>;

/** Directly attributed events and their containing lifecycles. */
export type EventGroupMarkerGroup = Readonly<{
  identity: EventGroupMarkerIdentity;
  marker: EventGroupMarker;
  eventIds: ReadonlySet<HistoryEventId>;
  lifecycleHeadEventIds: ReadonlySet<HistoryEventId>;
  revision: number;
}>;

export type EventGroupMarkerGroupMutable = Omit<
  EventGroupMarkerGroup,
  'marker' | 'eventIds' | 'lifecycleHeadEventIds' | 'revision'
> & {
  marker: EventGroupMarker;
  eventIds: Set<HistoryEventId>;
  lifecycleHeadEventIds: Set<HistoryEventId>;
  revision: number;
};

type EventGroupMarkerGroupChange = Readonly<{
  type: 'EVENT_GROUP_MARKER_GROUP_CHANGED';
  eventGroupMarkerKey: EventGroupMarkerKey;
}>;

export type EventGroupMarkerGroupsProjectionChange =
  EventGroupMarkerGroupChange;
