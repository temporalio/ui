import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import type { Payload } from '$lib/types';
import type { EventGroupMarker, WorkflowEvent } from '$lib/types/events';
import { isActivityTaskStartedEvent } from '$lib/utilities/is-event-type';

export interface TimelineEventMarkerGroup extends EventGroup {
  eventMarker: true;
  markerKey: string;
  eventGroupMarker: EventGroupMarker;
  lifecycleGroups: EventGroups;
  statusSummary: EventMarkerGroupStatusSummary;
}

export type EventMarkerGroupStatusSummary = {
  failed: number;
  timedOut: number;
  retries: number;
  canceled: number;
  terminated: number;
  paused: number;
};

// Materialized lifecycle groups keep their identity until their contents change.
// Weak keys let overlapping marker groups share the event scan without retaining
// obsolete lifecycle groups after the event buffer rematerializes them.
const lifecycleGroupStatusSummaryCache = new WeakMap<
  EventGroup,
  EventMarkerGroupStatusSummary
>();

type MarkerIdentity = EventGroupMarkerPresentation & {
  eventGroupMarker: EventGroupMarker;
};

type EventMarkerAttributionEntry = {
  event: WorkflowEvent;
  lifecycleGroupId: string;
};

export type EventMarkerAttribution = {
  key: string;
  eventGroupMarker: EventGroupMarker;
  eventsById: Map<string, EventMarkerAttributionEntry>;
  lifecycleGroupIds: Set<string>;
  firstEventByLifecycleGroupId: Map<string, WorkflowEvent>;
  firstEventId: string;
  orderedEvents?: WorkflowEvent[];
  orderedLifecycleGroupIds?: string[];
};

export type EventGroupMarkerPresentation = {
  key: string;
  displayName: string;
  label?: Payload;
};

export type EventGroupMarkerDescriptor = {
  markerKey: string;
  eventGroupMarker: EventGroupMarker;
  displayName: string;
  eventCount: number;
  firstEventId: string;
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
    };
  }

  const inboundEventId = marker.inboundEvent?.inboundEventId;
  if (inboundEventId !== undefined && inboundEventId !== null) {
    const id = inboundEventId;
    const indexedDisplayName = presentationLabelsByMarkerKey?.get(key);
    return {
      key,
      displayName: indexedDisplayName ?? id,
    };
  }

  const inboundUpdateId = marker.inboundUpdate?.inboundUpdateId;
  if (inboundUpdateId) {
    const indexedDisplayName = presentationLabelsByMarkerKey?.get(key);
    return {
      key,
      displayName: indexedDisplayName ?? inboundUpdateId,
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

export const createEventGroupMarkerDescriptor = (
  attribution: EventMarkerAttribution,
  presentationsByMarkerKey: ReadonlyMap<string, EventGroupMarkerPresentation>,
): EventGroupMarkerDescriptor | undefined => {
  const identity = getMarkerIdentity(
    attribution.eventGroupMarker,
    presentationsByMarkerKey,
  );
  if (!identity) return;

  return {
    markerKey: identity.key,
    eventGroupMarker: identity.eventGroupMarker,
    displayName: identity.displayName,
    eventCount: attribution.eventsById.size,
    firstEventId: attribution.firstEventId,
  };
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
  eventCount: 1,
});

const attemptNumber = (value: unknown): number => {
  const attempt = Number(value);
  return Number.isFinite(attempt) && attempt > 0 ? attempt : 0;
};

const getLifecycleGroupStatusSummary = (
  group: EventGroup,
): EventMarkerGroupStatusSummary => {
  const cached = lifecycleGroupStatusSummaryCache.get(group);
  if (cached) return cached;

  const summary: EventMarkerGroupStatusSummary = {
    failed: 0,
    timedOut: 0,
    retries: 0,
    canceled: 0,
    terminated: 0,
    paused: 0,
  };

  let highestAttempt = Math.max(
    attemptNumber(group.pendingActivity?.attempt),
    attemptNumber(group.pendingNexusOperation?.attempt),
  );
  for (const event of group.eventList) {
    const classification = event.classification;
    summary.failed ||= Number(classification === 'Failed');
    summary.timedOut ||= Number(classification === 'TimedOut');
    if (isActivityTaskStartedEvent(event)) {
      highestAttempt = Math.max(
        highestAttempt,
        attemptNumber(event.attributes.attempt),
      );
    }
  }
  summary.canceled = Number(group.isCanceled);
  summary.terminated = Number(group.isTerminated);
  summary.paused = Number(Boolean(group.pendingActivity?.paused));
  summary.retries = Math.max(0, highestAttempt - 1);

  lifecycleGroupStatusSummaryCache.set(group, summary);
  return summary;
};

const summarizeEventMarkerLifecycleGroups = (
  lifecycleGroups: EventGroups,
): {
  statusSummary: EventMarkerGroupStatusSummary;
  lastEvent?: WorkflowEvent;
  isPending: boolean;
  isFailureOrTimedOut: boolean;
  isCanceled: boolean;
  isTerminated: boolean;
} => {
  const statusSummary: EventMarkerGroupStatusSummary = {
    failed: 0,
    timedOut: 0,
    retries: 0,
    canceled: 0,
    terminated: 0,
    paused: 0,
  };
  let lastEvent: WorkflowEvent | undefined;
  let isPending = false;
  let isFailureOrTimedOut = false;
  let isCanceled = false;
  let isTerminated = false;

  for (const group of lifecycleGroups) {
    const groupSummary = getLifecycleGroupStatusSummary(group);
    statusSummary.failed += groupSummary.failed;
    statusSummary.timedOut += groupSummary.timedOut;
    statusSummary.retries += groupSummary.retries;
    statusSummary.canceled += groupSummary.canceled;
    statusSummary.terminated += groupSummary.terminated;
    statusSummary.paused += groupSummary.paused;
    isPending ||= group.isPending;
    isFailureOrTimedOut ||= group.isFailureOrTimedOut;
    isCanceled ||= group.isCanceled;
    isTerminated ||= group.isTerminated;

    if (!lastEvent || Number(group.lastEvent.id) > Number(lastEvent.id)) {
      lastEvent = group.lastEvent;
    }
  }

  return {
    statusSummary,
    lastEvent,
    isPending,
    isFailureOrTimedOut,
    isCanceled,
    isTerminated,
  };
};

const getCachedOrderedAttributedEvents = (
  attribution: EventMarkerAttribution,
): WorkflowEvent[] => {
  if (!attribution.orderedEvents) {
    attribution.orderedEvents = [...attribution.eventsById.values()]
      .map(({ event }) => event)
      .toSorted((a, b) => Number(a.id) - Number(b.id));
  }
  return attribution.orderedEvents;
};

export const getCachedOrderedLifecycleGroupIds = (
  attribution: EventMarkerAttribution,
): string[] => {
  if (!attribution.orderedLifecycleGroupIds) {
    attribution.orderedLifecycleGroupIds = [
      ...attribution.lifecycleGroupIds,
    ].toSorted((a, b) => Number(a) - Number(b));
  }
  return attribution.orderedLifecycleGroupIds;
};

const toTimelineEventMarkerGroup = (
  marker: MarkerIdentity & {
    attribution: EventMarkerAttribution;
    lifecycleGroups: EventGroups;
  },
): TimelineEventMarkerGroup | undefined => {
  const attributedEvents = getCachedOrderedAttributedEvents(marker.attribution);
  const lifecycleGroups = marker.lifecycleGroups;
  if (!attributedEvents.length) return;

  const eventList = attributedEvents;
  const initialEvent = eventList[0];
  const lastAttributedEvent = eventList[eventList.length - 1];
  const {
    statusSummary,
    lastEvent: lastLifecycleEvent,
    isPending,
    isFailureOrTimedOut,
    isCanceled,
    isTerminated,
  } = summarizeEventMarkerLifecycleGroups(lifecycleGroups);
  const lastEvent =
    lastLifecycleEvent &&
    Number(lastLifecycleEvent.id) > Number(lastAttributedEvent.id)
      ? lastLifecycleEvent
      : lastAttributedEvent;

  return {
    eventMarker: true,
    markerKey: marker.key,
    eventGroupMarker: marker.eventGroupMarker,
    lifecycleGroups,
    statusSummary,
    id: `event-marker:${marker.key}`,
    name: marker.displayName,
    label: marker.displayName,
    displayName: marker.displayName,
    eventList,
    initialEvent,
    lastEvent,
    timestamp: initialEvent.timestamp,
    classification: isPending ? 'Running' : 'Completed',
    finalClassification: isPending ? 'Running' : 'Completed',
    category: 'other',
    eventTime: lastEvent.eventTime,
    attributes: lastEvent.attributes,
    isPending,
    isFailureOrTimedOut,
    isCanceled,
    isTerminated,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    userMetadata: marker.label ? { summary: marker.label } : undefined,
    // Marker groups are presentation-only containers. Their child lifecycle
    // groups retain links and billable-action information.
    links: [],
    billableActions: 0,
    eventCount: attributedEvents.length,
  };
};

export const createTimelineEventMarkerGroup = (
  attribution: EventMarkerAttribution,
  lifecycleGroups: EventGroups,
  presentationsByMarkerKey: ReadonlyMap<string, EventGroupMarkerPresentation>,
): TimelineEventMarkerGroup | undefined => {
  const identity = getMarkerIdentity(
    attribution.eventGroupMarker,
    presentationsByMarkerKey,
  );
  if (!identity) return;

  return toTimelineEventMarkerGroup({
    ...identity,
    attribution,
    lifecycleGroups,
  });
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
      const attributedLifecycleGroups: EventGroup[] = [];
      for (const lifecycleGroupId of getCachedOrderedLifecycleGroupIds(
        attribution,
      )) {
        const group = lifecycleGroupsById.get(lifecycleGroupId);
        if (group) {
          attributedLifecycleGroups.push(group);
        } else {
          const event =
            attribution.firstEventByLifecycleGroupId.get(lifecycleGroupId);
          if (event) {
            attributedLifecycleGroups.push(toStandaloneLifecycleGroup(event));
          }
        }
      }

      return createTimelineEventMarkerGroup(
        attribution,
        attributedLifecycleGroups,
        presentationsByMarkerKey,
      );
    })
    .filter((group): group is TimelineEventMarkerGroup => Boolean(group))
    .toSorted((a, b) => Number(a.initialEvent.id) - Number(b.initialEvent.id));
};

export const isTimelineEventMarkerGroup = (
  group: EventGroup,
): group is TimelineEventMarkerGroup =>
  'eventMarker' in group && group.eventMarker === true;

export const eventMatchesEventGroupFilter = (
  event: WorkflowEvent,
  markerKeys: ReadonlySet<string>,
): boolean => {
  if (!markerKeys.size) return true;
  return Boolean(
    event.eventGroupMarkers?.some((marker) => {
      const key = getEventGroupMarkerKey(marker);
      return key ? markerKeys.has(key) : false;
    }),
  );
};
