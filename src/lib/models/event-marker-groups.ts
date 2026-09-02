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

export type EventGroupMarkerPresentation = {
  key: string;
  displayName: string;
  label?: Payload;
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

export const getEventMarkerGroupStatusSummary = (
  lifecycleGroups: EventGroups,
): EventMarkerGroupStatusSummary => {
  const summary: EventMarkerGroupStatusSummary = {
    failed: 0,
    timedOut: 0,
    retries: 0,
    canceled: 0,
    terminated: 0,
    paused: 0,
  };

  for (const group of lifecycleGroups) {
    const groupSummary = getLifecycleGroupStatusSummary(group);
    summary.failed += groupSummary.failed;
    summary.timedOut += groupSummary.timedOut;
    summary.retries += groupSummary.retries;
    summary.canceled += groupSummary.canceled;
    summary.terminated += groupSummary.terminated;
    summary.paused += groupSummary.paused;
  }

  return summary;
};

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
    statusSummary: getEventMarkerGroupStatusSummary(lifecycleGroups),
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
    isPending: lifecycleGroups.some((group) => group.isPending),
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
    eventCount: attributedEvents.length,
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

export const lifecycleGroupMatchesEventGroupFilter = (
  group: EventGroup,
  markerKeys: ReadonlySet<string>,
): boolean => {
  if (!markerKeys.size) return true;
  return group.eventList.some((event) =>
    eventMatchesEventGroupFilter(event, markerKeys),
  );
};
