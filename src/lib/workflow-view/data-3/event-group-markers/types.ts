import type { EventGroupMarker } from '$lib/types/events';

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
  eventIds: ReadonlySet<string>;
  lifecycleHeadEventIds: ReadonlySet<string>;
  revision: number;
}>;

export type EventGroupMarkerGroupMutable = Omit<
  EventGroupMarkerGroup,
  'marker' | 'eventIds' | 'lifecycleHeadEventIds' | 'revision'
> & {
  marker: EventGroupMarker;
  eventIds: Set<string>;
  lifecycleHeadEventIds: Set<string>;
  revision: number;
};
