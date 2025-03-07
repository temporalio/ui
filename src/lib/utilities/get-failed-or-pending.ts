import { isEventGroup } from '$lib/models/event-groups';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { isEvent } from '$lib/models/event-history';
import type {
  IterableEventWithPending,
  WorkflowEvent,
} from '$lib/types/events';

import { isLocalActivityMarkerEvent } from './is-event-type';
import {
  isPendingActivity,
  isPendingNexusOperation,
} from './is-pending-activity';

const isFailedLocalActivity = (event: WorkflowEvent) => {
  return (
    isLocalActivityMarkerEvent(event) &&
    event.markerRecordedEventAttributes.failure
  );
};

const isFailedLocalActivityGroup = (group: EventGroup) => {
  return isFailedLocalActivity(group.initialEvent);
};

const isFailedEvent = (iterable: IterableEventWithPending) => {
  return (
    isEvent(iterable) &&
    (iterable.classification === 'Failed' ||
      iterable.classification === 'TimedOut' ||
      isFailedLocalActivity(iterable))
  );
};

const isPendingEvent = (iterable: IterableEventWithPending) => {
  return isPendingActivity(iterable) || isPendingNexusOperation(iterable);
};

const isFailedEventGroup = (iterable: IterableEventWithPending) => {
  return (
    isEventGroup(iterable) &&
    (iterable.classification === 'Failed' ||
      iterable.classification === 'TimedOut' ||
      isFailedLocalActivityGroup(iterable))
  );
};

const isPendingEventGroup = (iterable: IterableEventWithPending) => {
  return isEventGroup(iterable) && iterable.isPending;
};

export const getFailedOrPendingEvents = (
  items: IterableEventWithPending[],
  filterForFailedOrPending: boolean,
) => {
  if (!filterForFailedOrPending) return items;
  return items.filter(
    (item) =>
      isFailedEvent(item) ||
      isPendingEvent(item) ||
      isFailedEventGroup(item) ||
      isPendingEventGroup(item),
  );
};

export const getFailedOrPendingGroups = (
  items: EventGroup[],
  filterForFailedOrPending: boolean,
) => {
  if (!filterForFailedOrPending) return items;
  return items.filter(
    (item) => isFailedEventGroup(item) || isPendingEventGroup(item),
  );
};
