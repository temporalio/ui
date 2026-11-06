import type { Payload } from '$lib/types';
import type { EventType } from '$lib/types/events';

import type { HistoryEventId } from '../history-events/types';

/** Identifies a Workflow Update request within one execution. */
export type UpdateId = string;

/** Identifies an explicit marker label group, independently of its display text. */
export type MarkerLabelId = string;

/** A normalized marker with only the fields relevant to its attribution kind. */
export type EventGroupMarkerDescriptor =
  | Readonly<{
      type: 'label';
      id: MarkerLabelId;
      payload: Payload | null;
    }>
  | Readonly<{
      type: 'inbound-event';
      eventId: HistoryEventId;
    }>
  | Readonly<{
      type: 'inbound-update';
      updateId: UpdateId;
    }>;

export type EventGroupMarkerKey = `event-group-marker:(${string})`;

export type KeyedEventGroupMarker = Readonly<{
  key: EventGroupMarkerKey;
  marker: EventGroupMarkerDescriptor;
}>;

/** Source metadata resolved on demand from canonical history events. */
export type EventGroupMarkerSource = Readonly<{
  eventId: HistoryEventId;
  eventType: EventType;
  name: string | null;
}>;

/** Directly attributed events and their containing lifecycles. */
export type EventGroupMarkerGroup = Readonly<{
  marker: EventGroupMarkerDescriptor;
  eventIds: ReadonlySet<HistoryEventId>;
  lifecycleHeadEventIds: ReadonlySet<HistoryEventId>;
  revision: number;
}>;

export type EventGroupMarkerGroupMutable = Omit<
  EventGroupMarkerGroup,
  'marker' | 'eventIds' | 'lifecycleHeadEventIds' | 'revision'
> & {
  marker: EventGroupMarkerDescriptor;
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
