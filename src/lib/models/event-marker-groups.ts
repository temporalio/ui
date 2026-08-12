import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import type { Payload } from '$lib/types';
import type { EventGroupMarker, WorkflowEvent } from '$lib/types/events';

export interface TimelineEventMarkerGroup extends EventGroup {
  eventMarker: true;
  markerKey: string;
  eventGroupMarker: EventGroupMarker;
  lifecycleGroups: EventGroups;
}

type MarkerIdentity = EventGroupMarkerPresentation & {
  eventGroupMarker: EventGroupMarker;
};

type MarkerAccumulator = MarkerIdentity & {
  events: WorkflowEvent[];
  lifecycleGroups: Map<string, EventGroup>;
};

type EventMarkerAttributionEntry = {
  event: WorkflowEvent;
  lifecycleGroupId: string;
};

export type EventMarkerAttribution = {
  key: string;
  eventGroupMarker: EventGroupMarker;
  eventsById: Map<string, EventMarkerAttributionEntry>;
};

export type EventGroupMarkerIcon = 'pencil' | 'signal' | 'update';

export type EventGroupMarkerPresentation = {
  key: string;
  displayName: string;
  label?: Payload;
  icon: EventGroupMarkerIcon;
};

export const getEventGroupMarkerKey = (
  marker: EventGroupMarker,
): string | undefined => {
  if (marker.label?.id) return `label:${marker.label.id}`;
  if (marker.inboundEvent?.inboundEventId != null) {
    return `event:${marker.inboundEvent.inboundEventId}`;
  }
  if (marker.inboundUpdate?.inboundUpdateId) {
    return `update:${marker.inboundUpdate.inboundUpdateId}`;
  }
};

export const getEventGroupMarkerPresentation = (
  marker: EventGroupMarker,
  presentationLabelsByMarkerKey?: ReadonlyMap<string, string>,
): EventGroupMarkerPresentation | undefined => {
  const key = getEventGroupMarkerKey(marker);
  if (!key) return;

  const labelId = marker.label?.id;
  if (labelId) {
    return {
      key,
      displayName: labelId,
      label: marker.label?.label ?? undefined,
      icon: 'pencil',
    };
  }

  const inboundEventId = marker.inboundEvent?.inboundEventId;
  if (inboundEventId !== undefined && inboundEventId !== null) {
    const id = inboundEventId;
    const indexedDisplayName = presentationLabelsByMarkerKey?.get(key);
    return {
      key,
      displayName: indexedDisplayName ?? id,
      icon: 'signal',
    };
  }

  const inboundUpdateId = marker.inboundUpdate?.inboundUpdateId;
  if (inboundUpdateId) {
    const indexedDisplayName = presentationLabelsByMarkerKey?.get(key);
    return {
      key,
      displayName: indexedDisplayName ?? inboundUpdateId,
      icon: 'update',
    };
  }
};

const getMarkerIdentity = (
  marker: EventGroupMarker,
  presentationsByMarkerKey: ReadonlyMap<string, EventGroupMarkerPresentation>,
): MarkerIdentity | undefined => {
  const key = getEventGroupMarkerKey(marker);
  if (!key) return;
  const presentation =
    presentationsByMarkerKey.get(key) ??
    getEventGroupMarkerPresentation(marker);
  if (!presentation) return;
  return { ...presentation, eventGroupMarker: marker };
};

const toStandaloneLifecycleGroup = (event: WorkflowEvent): EventGroup => ({
  id: `event-marker-event:${event.id}`,
  name: event.name,
  label: event.name,
  displayName: event.name,
  eventList: [event],
  initialEvent: event,
  lastEvent: event,
  timestamp: event.timestamp,
  classification: event.classification,
  finalClassification: event.classification,
  category: event.category,
  eventTime: event.eventTime,
  attributes: event.attributes,
  isPending: false,
  isFailureOrTimedOut: false,
  isCanceled: false,
  isTerminated: false,
  level: undefined,
  pendingActivity: undefined,
  pendingNexusOperation: undefined,
  links: event.links ?? [],
  billableActions: event.billableActions ?? 0,
});

const toTimelineEventMarkerGroup = (
  marker: MarkerAccumulator,
): TimelineEventMarkerGroup | undefined => {
  const attributedEvents = marker.events.toSorted(
    (a, b) => Number(a.id) - Number(b.id),
  );
  const lifecycleGroups = [...marker.lifecycleGroups.values()].toSorted(
    (a, b) => Number(a.initialEvent.id) - Number(b.initialEvent.id),
  );
  if (!attributedEvents.length) return;

  const eventList = attributedEvents;
  const initialEvent = eventList[0];
  const lastEvent = eventList[eventList.length - 1];

  return {
    eventMarker: true,
    markerKey: marker.key,
    eventGroupMarker: marker.eventGroupMarker,
    lifecycleGroups,
    id: `event-marker:${marker.key}`,
    name: marker.displayName,
    label: marker.displayName,
    displayName: marker.displayName,
    eventList,
    initialEvent,
    lastEvent,
    timestamp: initialEvent.timestamp,
    classification: 'Open',
    finalClassification: 'Open',
    category: 'other',
    eventTime: lastEvent.eventTime,
    attributes: lastEvent.attributes,
    isPending: false,
    isFailureOrTimedOut: lifecycleGroups.some(
      (group) => group.isFailureOrTimedOut,
    ),
    isCanceled: lifecycleGroups.some((group) => group.isCanceled),
    isTerminated: lifecycleGroups.some((group) => group.isTerminated),
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    userMetadata: marker.label ? { summary: marker.label } : undefined,
    links: attributedEvents.flatMap((event) => event.links ?? []),
    billableActions: attributedEvents.reduce(
      (total, event) => total + (event.billableActions ?? 0),
      0,
    ),
  };
};

export const createTimelineEventMarkerGroups = (
  attributions: Iterable<EventMarkerAttribution>,
  lifecycleGroups: EventGroups,
  presentationsByMarkerKey: ReadonlyMap<string, EventGroupMarkerPresentation>,
): TimelineEventMarkerGroup[] => {
  const lifecycleGroupsById = new Map(
    lifecycleGroups.map((group) => [group.id, group]),
  );

  return [...attributions]
    .map((attribution) => {
      const identity = getMarkerIdentity(
        attribution.eventGroupMarker,
        presentationsByMarkerKey,
      );
      if (!identity) return;

      const attributedEvents: WorkflowEvent[] = [];
      const attributedLifecycleGroups = new Map<string, EventGroup>();
      for (const {
        event,
        lifecycleGroupId,
      } of attribution.eventsById.values()) {
        attributedEvents.push(event);
        const group = lifecycleGroupsById.get(lifecycleGroupId);
        if (group) {
          attributedLifecycleGroups.set(lifecycleGroupId, group);
        } else {
          const standalone = toStandaloneLifecycleGroup(event);
          attributedLifecycleGroups.set(standalone.id, standalone);
        }
      }

      return toTimelineEventMarkerGroup({
        ...identity,
        events: attributedEvents,
        lifecycleGroups: attributedLifecycleGroups,
      });
    })
    .filter((group): group is TimelineEventMarkerGroup => Boolean(group))
    .toSorted((a, b) => Number(a.initialEvent.id) - Number(b.initialEvent.id));
};

export const isTimelineEventMarkerGroup = (
  group: EventGroup,
): group is TimelineEventMarkerGroup =>
  'eventMarker' in group && group.eventMarker === true;
