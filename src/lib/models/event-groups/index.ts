import { has } from '$lib/utilities/has';
import { createEventGroup } from './create-event-group';
import { getGroupId } from './get-group-id';

import type { EventSortOrder } from '$lib/stores/event-view';
import { isSubrowActivity } from '$lib/utilities/is-subrow-activity';
import {
  eventOrGroupIsCanceled,
  eventOrGroupIsFailureOrTimedOut,
  eventOrGroupIsTerminated,
} from './get-event-in-group';

export { getGroupForEvent } from './get-group-for-event';

const addToExistingGroup = (group: EventGroup, event: WorkflowEvent): void => {
  if (!group) return;

  group.events.set(event.id, event);
  group.eventIds.add(event.id);

  group.timestamp = event.timestamp;
};

const groupIsCanceledFailureTimedOutTerminated = (group: IterableEvent) => {
  return (
    eventOrGroupIsCanceled(group) ||
    eventOrGroupIsFailureOrTimedOut(group) ||
    eventOrGroupIsTerminated(group)
  );
};

type GroupEventOptions = {
  createWorkflowTaskGroups: boolean;
  nonCompletedEventsOnly: boolean;
};

const addPendingActivity = (
  group: EventGroup,
  pendingActivities: PendingActivity[],
) => {
  const pendingActivityForGroup = pendingActivities.find((pending) =>
    group.eventList.find((e) => e.id === pending.activityId),
  );
  if (pendingActivityForGroup) group.pendingActivity = pendingActivityForGroup;
};

export const groupEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
  pendingActivities: PendingActivity[] = [],
  options: GroupEventOptions = {
    createWorkflowTaskGroups: false,
    nonCompletedEventsOnly: false,
  },
): EventGroups => {
  const { createWorkflowTaskGroups, nonCompletedEventsOnly } = options;
  const groupMap: Record<string, EventGroup> = {};

  for (const event of events) {
    const id = getGroupId(event);
    const group = createEventGroup(event, createWorkflowTaskGroups);

    if (group) {
      groupMap[group.id] = group;
    } else {
      addToExistingGroup(groupMap[id], event);
    }
  }

  let groups = Object.values(groupMap);
  for (const group of groups) {
    addPendingActivity(group, pendingActivities);

    if (createWorkflowTaskGroups && isSubrowActivity(group.initialEvent)) {
      const workflowTaskId =
        group.initialEvent.attributes?.workflowTaskCompletedEventId;
      const workflowTaskGroup = groups.find(
        (g) => g.lastEvent?.eventId === workflowTaskId,
      );
      if (workflowTaskGroup) {
        workflowTaskGroup.subGroups.set(group.id, group);
        groups = groups.filter((g) => g.id !== group.id);
      } else {
        console.error('No task group found!');
      }
    }
  }

  if (nonCompletedEventsOnly) {
    for (const group of groups) {
      if (
        !groupIsCanceledFailureTimedOutTerminated(group) &&
        group.subGroupList.every(
          (e) => !groupIsCanceledFailureTimedOutTerminated(e),
        )
      ) {
        groups = groups.filter((g) => g.id !== group.id);
      }
    }
  }

  return sort === 'descending'
    ? Object.values(groups).reverse()
    : Object.values(groups);
};

export const isEventGroup = (
  eventOrGroup: unknown,
): eventOrGroup is EventGroup => {
  if (eventOrGroup === undefined || eventOrGroup === null) return false;
  return has(eventOrGroup, 'events');
};

export const isEventGroups = (
  eventsOrGroups: unknown[],
): eventsOrGroups is EventGroups => {
  if (eventsOrGroups === undefined || eventsOrGroups === null) return false;
  return eventsOrGroups.every(isEventGroup);
};
