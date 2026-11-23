import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';
import {
  isActivityTaskStartedEvent,
  isFailedWorkflowExecutionUpdateCompletedEvent,
  isLocalActivityMarkerEvent,
} from '$lib/utilities/is-event-type';

import {
  type EventGroupKey,
  type EventGroupLabel,
  formatEventGroupName,
} from './event-group-markers';

export type TimelineEventGroupLifecycle = {
  readonly id: string;
  readonly version?: number;
  readonly eventCount: number;
  readonly initialEvent: WorkflowEvent;
  readonly lastEvent: WorkflowEvent;
  readonly category: WorkflowEvent['category'];
  readonly classification: WorkflowEvent['classification'];
  readonly isPending: boolean;
};

export interface TimelineEventGroup<
  T extends TimelineEventGroupLifecycle = TimelineEventGroupLifecycle,
> extends EventGroup {
  readonly isTimelineEventGroup: true;
  readonly key: EventGroupKey;
  readonly eventGroupLabel: EventGroupLabel;
  readonly lifecycleGroups: T[];
  readonly version: number;
}

export type TimelineEventGroupStatusSummary = {
  failed: number;
  timedOut: number;
  retries: number;
  canceled: number;
  terminated: number;
  paused: number;
};

export const timelineEventGroupId = (key: EventGroupKey): string =>
  `event-group:${key}`;

export const isTimelineEventGroup = (
  group: unknown,
): group is TimelineEventGroup =>
  typeof group === 'object' &&
  group !== null &&
  'isTimelineEventGroup' in group &&
  group.isTimelineEventGroup === true;

export type TimelineEventGroupTotals = {
  initialEvent: WorkflowEvent;
  lastEvent: WorkflowEvent;
  eventCount: number;
  isPending: boolean;
  version: number;
};

export const toTimelineEventGroup = <T extends TimelineEventGroupLifecycle>(
  label: EventGroupLabel,
  lifecycleGroups: T[],
  {
    initialEvent,
    lastEvent,
    eventCount,
    isPending,
    version,
  }: TimelineEventGroupTotals,
): TimelineEventGroup<T> => {
  const name = formatEventGroupName(label);
  const classification = isPending ? 'Running' : 'Completed';

  return {
    isTimelineEventGroup: true,
    key: label.key,
    eventGroupLabel: label,
    lifecycleGroups,
    version,
    id: timelineEventGroupId(label.key),
    name,
    label: name,
    displayName: name,
    eventList:
      initialEvent === lastEvent ? [initialEvent] : [initialEvent, lastEvent],
    eventCount,
    initialEvent,
    lastEvent,
    timestamp: lastEvent.timestamp,
    eventTime: lastEvent.eventTime,
    attributes: lastEvent.attributes,
    classification,
    finalClassification: classification,
    category: 'other',
    isPending,
    isFailureOrTimedOut: false,
    isCanceled: false,
    isTerminated: false,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    links: [],
    billableActions: 0,
  };
};

export const createTimelineEventGroup = <
  T extends TimelineEventGroupLifecycle,
>({
  label,
  lifecycleGroups,
  previous,
}: {
  label: EventGroupLabel;
  lifecycleGroups: T[];
  previous?: TimelineEventGroup<T>;
}): TimelineEventGroup<T> | undefined => {
  if (!lifecycleGroups.length) return;

  let initialEvent = lifecycleGroups[0].initialEvent;
  let lastEvent = lifecycleGroups[0].lastEvent;
  let isPending = false;
  let eventCount = 0;
  let version = 0;
  for (const group of lifecycleGroups) {
    eventCount += group.eventCount;
    version += 1 + (group.version ?? 0);
    if (Number(group.initialEvent.id) < Number(initialEvent.id)) {
      initialEvent = group.initialEvent;
    }
    if (Number(group.lastEvent.id) > Number(lastEvent.id)) {
      lastEvent = group.lastEvent;
    }
    isPending ||= group.isPending;
  }

  if (
    previous &&
    previous.version === version &&
    previous.eventGroupLabel === label &&
    previous.name === formatEventGroupName(label) &&
    previous.lifecycleGroups.length === lifecycleGroups.length &&
    previous.lifecycleGroups.every(
      (group, index) => group === lifecycleGroups[index],
    )
  ) {
    return previous;
  }

  return toTimelineEventGroup(label, lifecycleGroups, {
    initialEvent,
    lastEvent,
    eventCount,
    isPending,
    version,
  });
};

export const createTimelineEventGroupFilter = <
  T extends TimelineEventGroupLifecycle,
>() => {
  let filtered = new Map<EventGroupKey, TimelineEventGroup<T>>();

  return (
    groups: TimelineEventGroup<T>[],
    include: (lifecycleGroup: T) => boolean,
  ): TimelineEventGroup<T>[] => {
    const next = new Map<EventGroupKey, TimelineEventGroup<T>>();
    const result: TimelineEventGroup<T>[] = [];
    for (const group of groups) {
      if (group.lifecycleGroups.every(include)) {
        result.push(group);
        continue;
      }
      const lifecycleGroups = group.lifecycleGroups.filter(include);
      const filteredGroup = createTimelineEventGroup({
        label: group.eventGroupLabel,
        lifecycleGroups,
        previous: filtered.get(group.key),
      });
      if (!filteredGroup) continue;
      next.set(group.key, filteredGroup);
      result.push(filteredGroup);
    }
    filtered = next;
    return result;
  };
};

const attemptNumber = (value: unknown): number => {
  const attempt = Number(value);
  return Number.isFinite(attempt) && attempt > 0 ? attempt : 0;
};

export type LifecycleEventStatus = {
  failed: boolean;
  timedOut: boolean;
  highestAttempt: number;
};

export const createLifecycleEventStatus = (): LifecycleEventStatus => ({
  failed: false,
  timedOut: false,
  highestAttempt: 0,
});

export const addLifecycleEvent = (
  status: LifecycleEventStatus,
  event: WorkflowEvent,
): void => {
  status.failed ||=
    event.classification === 'Failed' ||
    isFailedWorkflowExecutionUpdateCompletedEvent(event) ||
    Boolean(
      isLocalActivityMarkerEvent(event) &&
      event.markerRecordedEventAttributes?.failure,
    );

  status.timedOut ||= event.classification === 'TimedOut';

  if (isActivityTaskStartedEvent(event)) {
    status.highestAttempt = Math.max(
      status.highestAttempt,
      attemptNumber(event.attributes.attempt),
    );
  }
};

export const lifecycleRetries = (
  highestAttempt: number,
  {
    pendingActivity,
    pendingNexusOperation,
  }: Pick<EventGroup, 'pendingActivity' | 'pendingNexusOperation'>,
): number =>
  Math.max(
    0,
    Math.max(
      highestAttempt,
      attemptNumber(pendingActivity?.attempt),
      attemptNumber(pendingNexusOperation?.attempt),
    ) - 1,
  );

export const summarizeLifecycleGroups = (
  groups: readonly EventGroup[],
): TimelineEventGroupStatusSummary => {
  const summary: TimelineEventGroupStatusSummary = {
    failed: 0,
    timedOut: 0,
    retries: 0,
    canceled: 0,
    terminated: 0,
    paused: 0,
  };

  for (const group of groups) {
    const status = createLifecycleEventStatus();
    for (const event of group.eventList) {
      addLifecycleEvent(status, event);
    }
    summary.failed += Number(status.failed);
    summary.timedOut += Number(status.timedOut);
    summary.canceled += Number(group.isCanceled);
    summary.terminated += Number(group.isTerminated);
    summary.paused += Number(Boolean(group.pendingActivity?.paused));
    summary.retries += lifecycleRetries(status.highestAttempt, group);
  }

  return summary;
};
