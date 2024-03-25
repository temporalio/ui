import type { IconName } from '$lib/holocene/icon/paths';
import { isEventGroup } from '$lib/models/event-groups';
import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import type {
  EventTypeCategory,
  PendingActivity,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import {
  formatAttributes,
  formatPendingAttributes,
} from '$lib/utilities/format-event-attributes';
import {
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';
import { isPendingActivity } from '$lib/utilities/is-pending-activity';

export type GraphView = 'compact' | 'timeline' | 'history';

const baseRadius = 8;

export const DetailsChildTimelineHeight = 200;

export type GraphConfig = {
  height: number;
  gutter: number;
  radius: number;
  fontSizeRatio: number;
};

export const CompactConfig: GraphConfig = {
  height: baseRadius * 8,
  gutter: baseRadius * 0,
  radius: baseRadius * 3,
  fontSizeRatio: baseRadius * 3,
};

export const TimelineConfig: GraphConfig = {
  height: baseRadius * 6,
  gutter: baseRadius * 3,
  radius: baseRadius * 2,
  fontSizeRatio: baseRadius * 3,
};

export const HistoryConfig: GraphConfig = {
  height: baseRadius * 4,
  gutter: baseRadius * 2,
  radius: baseRadius,
  fontSizeRatio: baseRadius * 3,
};

export const CategoryIcon: Record<EventTypeCategory, IconName> = {
  workflow: 'workflow',
  signal: 'signal',
  command: 'sliders',
  activity: 'activity',
  marker: 'pin',
  timer: 'retention',
  'local-activity': 'summary',
  'child-workflow': 'relationship',
  update: 'merge',
};

export const isMiddleEvent = (
  event: WorkflowEvent,
  groups: EventGroups,
): boolean => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  if (!group) return false;
  const ids = Array.from(group.eventIds);
  return ids.indexOf(event.id) === 1 && group.eventList.length === 3;
};

const pairIsConsecutive = (x: string, y: string) => {
  return parseInt(x) === parseInt(y) - 1;
};

const isConsecutiveGroup = (group: EventGroup): boolean => {
  const ids = Array.from(group.eventIds);
  if (ids.length === 1) return true;
  if (ids.length === 2) return pairIsConsecutive(ids[0], ids[1]);
  if (ids.length === 3) {
    return (
      pairIsConsecutive(ids[0], ids[1]) && pairIsConsecutive(ids[1], ids[2])
    );
  }
};

export const isPendingGroup = (group: EventGroup) =>
  Boolean(
    group.pendingActivity ||
      (isTimerStartedEvent(group.initialEvent) &&
        group.eventList.length === 1) ||
      (isStartChildWorkflowExecutionInitiatedEvent(group.initialEvent) &&
        group.eventList.length === 2),
  );

const getOpenGroups = (
  event: WorkflowEvent | PendingActivity,
  groups: EventGroups,
  pendingActivity?: PendingActivity,
): number => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  if (!group.pendingActivity && pendingActivity) {
    group.pendingActivity = pendingActivity;
  }
  if (group.level !== undefined) return group.level;

  const pendingGroups = groups
    .filter((g) => isPendingGroup(g) && g.id !== group.id)
    .filter(
      (g) => parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    );

  const nonPendingGroups = groups
    .filter(
      (g) => g.eventList.length > 1 && !isPendingGroup(g) && g.id !== group.id,
    )
    .filter(
      (g) => parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    )
    .filter((g) => parseInt(g.lastEvent.id) > parseInt(group.initialEvent.id));

  const openGroups = [...pendingGroups, ...nonPendingGroups];

  if (!openGroups.length && isConsecutiveGroup(group)) {
    group.level = 0;
  }
  group.level = openGroups.length + 2;
  return group.level;
};

export const activeEventsHeightAboveGroup = (
  activeEvents: string[],
  event: WorkflowEvent,
  history: WorkflowEvents,
  groups: EventGroups,
  height: number,
) => {
  return activeEvents
    .filter((id) => parseInt(id) < parseInt(event.id))
    .map((id) => {
      const group = groups.find((group) => group.eventIds.has(id));
      const event = history.find((event) => event.id === id);
      return getDetailsBoxHeight(group ?? event, height);
    })
    .reduce((acc, height) => acc + height, 0);
};

export const getNextDistanceAndOffset = (
  history: WorkflowEvents,
  event: WorkflowEvent,
  index: number,
  groups: EventGroups,
  activeEvents: string[],
  height: number,
  fontSizeRatio: number,
): { nextDistance: number; offset: number; y: number } => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  const activeEventsAbove = activeEventsHeightAboveGroup(
    activeEvents,
    event,
    history,
    groups,
    fontSizeRatio,
  );
  let y = index * height + height / 2 + activeEventsAbove;
  let nextDistance = 0;
  let offset = 1;

  if (!group) {
    return { nextDistance, offset, y };
  }

  if (group.eventList.length === 1 && !isPendingGroup(group)) {
    return { nextDistance, offset, y };
  }

  const pendingActivity = group.pendingActivity;
  const currentIndex = group.eventList.indexOf(event);
  const nextEvent = group.eventList[currentIndex + 1];
  offset = getOpenGroups(event, groups, pendingActivity);

  if (!nextEvent && !isPendingGroup(group)) {
    return { nextDistance, offset, y };
  }

  if (
    isPendingActivity(event) &&
    event.activityId === group.pendingActivity.activityId
  ) {
    y = (history.length + 1) * height + height / 2 + activeEventsAbove;
    return { nextDistance, offset, y };
  }

  let diff = 0;
  if (nextEvent) {
    diff = parseInt(nextEvent.id) - parseInt(event.id);
  } else if (isPendingGroup(group)) {
    diff = history.length - parseInt(event.id) + 2;
  }
  nextDistance = diff * height;

  return { nextDistance, offset, y };
};

export const getEventCategoryColor = (
  category: EventTypeCategory | 'pending' | undefined,
): string => {
  switch (category) {
    case 'marker':
    case 'command':
      return '#ebebeb';
    case 'timer':
      return '#fbbf24';
    case 'signal':
      return '#ec4899';
    case 'activity':
      return '#a78bfa';
    case 'pending':
      return '#a78bfa';
    case 'child-workflow':
      return '#b2f8d9';
    case 'workflow':
      return '#059669';
    default:
      return '#141414';
  }
};

export const activeRowsHeightAboveGroup = (
  activeGroups: string[],
  groupIndex: number,
  timeGroups: EventGroups[],
  height: number,
) => {
  let activeRowsHeight = 0;
  activeGroups.forEach((id) => {
    const activeTimeGroup = timeGroups.find((timeGroup) =>
      timeGroup.find((g) => g.id === id),
    );
    const activeGroup = activeTimeGroup.find((g) => g.id === id);
    const activeRowIndex = activeTimeGroup.indexOf(activeGroup);
    if (activeRowIndex < groupIndex) {
      activeRowsHeight += getDetailsBoxHeight(activeGroup, height);
    }
  });

  return activeRowsHeight;
};

export const activeGroupsHeightAboveGroup = (
  activeGroups: string[],
  group: EventGroup,
  groups: EventGroups,
  height: number,
) => {
  return activeGroups
    .filter((id) => {
      return parseInt(id) < parseInt(group.id);
    })
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getDetailsBoxHeight(group, height);
    })
    .reduce((acc, height) => acc + height, 0);
};

export const mergeEventGroupDetails = (
  groupOrEvent: EventGroup | WorkflowEvent,
) => {
  if (isEventGroup(groupOrEvent)) {
    const attributes = groupOrEvent.eventList.map((event) =>
      formatAttributes(event),
    );
    const attributesList = groupOrEvent.pendingActivity
      ? [formatPendingAttributes(groupOrEvent.pendingActivity), ...attributes]
      : attributes;
    return attributesList.reduce((acc, attribute) => {
      return { ...acc, ...attribute };
    }, {});
  } else {
    return formatAttributes(groupOrEvent);
  }
};

export const getEventDetailsHeight = (
  groupOrEvent: EventGroup | WorkflowEvent,
  height: number,
) => {
  const attributes = mergeEventGroupDetails(groupOrEvent);
  const codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  const textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );
  return (
    codeBlockAttributes.length * 2 * height +
    textAttributes.length * height +
    2 * height
  );
};

export const getDetailsBoxHeight = (
  groupOrEvent: EventGroup | WorkflowEvent,
  height: number,
) => {
  const detailsHeight = getEventDetailsHeight(groupOrEvent, height);
  return groupOrEvent.category === 'child-workflow'
    ? DetailsChildTimelineHeight + detailsHeight
    : detailsHeight;
};
