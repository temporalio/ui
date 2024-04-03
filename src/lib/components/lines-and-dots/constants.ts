import type { IconName } from '$lib/holocene/icon/paths';
import { isEventGroup } from '$lib/models/event-groups';
import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import type {
  EventClassification,
  EventTypeCategory,
  PendingActivity,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';
import {
  formatAttributes,
  formatPendingAttributes,
} from '$lib/utilities/format-event-attributes';
import { isPendingActivity } from '$lib/utilities/is-pending-activity';

export const DetailsChildTimelineHeight = 200;

export type GraphConfig = {
  height: number;
  gutter: number;
  radius: number;
  fontSizeRatio: number;
};

const baseRadius = 8;

export const minCompactWidth = 200;

export const CompactConfig: GraphConfig = {
  height: baseRadius * 7,
  gutter: baseRadius * 6,
  radius: baseRadius * 3,
  fontSizeRatio: baseRadius * 3,
};

export const TimelineConfig: GraphConfig = {
  height: baseRadius * 4,
  gutter: baseRadius * 3,
  radius: baseRadius * 1.5,
  fontSizeRatio: baseRadius * 3,
};

export const HistoryConfig: GraphConfig = {
  height: baseRadius * 3,
  gutter: baseRadius * 2,
  radius: baseRadius * 0.75,
  fontSizeRatio: baseRadius * 3,
};

export const DetailsConfig: GraphConfig = {
  height: baseRadius * 4,
  gutter: baseRadius * 3,
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

export const timelineTextPosition = (
  points: number[],
  y: number,
  width: number,
  isPending: boolean,
  config: GraphConfig,
) => {
  const { radius } = config;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  let backdrop = false;
  let textAnchor = 'start';
  let textIndex = 0;

  const textToLeft = firstPoint > (1 / 3) * width;
  let textToRight = !textToLeft && lastPoint < (2 / 3) * width && !isPending;

  if (textToLeft) textAnchor = 'end';
  if (textToRight) textIndex = points.indexOf(lastPoint);

  let textX = textToRight
    ? lastPoint + 1.5 * radius
    : firstPoint - 1.5 * radius;

  // Pending or long events
  if (!textToRight && !textToLeft) {
    backdrop = true;
    textToRight = true;
    textX = firstPoint + 1.5 * radius;

    if (points.length === 2 && isPending) {
      const gap = points[1] - points[0];
      if (gap < width - points[1]) {
        textIndex = 1;
        textX = points[1] + 1.5 * radius;
      }
    }

    if (points.length > 2) {
      const gap1 = points[1] - points[0];
      const gap2 = points[2] - points[1];
      if (gap2 > gap1) {
        textIndex = 1;
        textX = points[1] + 1.5 * radius;
      }
    }
  }

  const textPosition = [textX, y] as [number, number];
  return { textPosition, textIndex, textAnchor, backdrop };
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
    .filter((g) => g.isPending && g.id !== group.id)
    .filter(
      (g) => parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    );

  const nonPendingGroups = groups
    .filter((g) => g.eventList.length > 1 && !g.isPending && g.id !== group.id)
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
) => {
  return activeEvents
    .filter((id) => parseInt(id) < parseInt(event.id))
    .map((id) => {
      const event = history.find((event) => event.id === id);
      const group = groups.find((group) => group.eventIds.has(id));
      return getDetailsBoxHeight(event ?? group);
    })
    .reduce((acc, height) => acc + height, 0);
};

export const getNextDistanceAndOffset = (
  history: WorkflowEvents,
  event: WorkflowEvent,
  index: number,
  groups: EventGroups,
  height: number,
  activeEvents: string[],
): { nextDistance: number; offset: number; y: number } => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  const activeEventHeights = activeEventsHeightAboveGroup(
    activeEvents,
    event,
    history,
    groups,
  );
  let y = index * height + height / 2 + activeEventHeights;
  let nextDistance = 0;
  let offset = 1;

  if (!group) {
    return { nextDistance, offset, y };
  }

  if (group.eventList.length === 1 && !group.isPending) {
    return { nextDistance, offset, y };
  }

  const pendingActivity = group.pendingActivity;
  const currentIndex = group.eventList.indexOf(event);
  const nextEvent = group.eventList[currentIndex + 1];
  if (event.category !== 'workflow') {
    offset = getOpenGroups(event, groups, pendingActivity);
  }

  if (!nextEvent && !group.isPending) {
    return { nextDistance, offset, y };
  }

  if (
    isPendingActivity(event) &&
    event.activityId === group.pendingActivity.activityId
  ) {
    y = (history.length + 1) * height + height / 2;
    return { nextDistance, offset, y };
  }

  let diff = 0;
  if (nextEvent) {
    diff = parseInt(nextEvent.id) - parseInt(event.id);
  } else if (group.isPending) {
    diff = history.length - parseInt(event.id) + 2;
  }
  nextDistance = diff * height;

  if (event && activeEvents[0] == event.id) {
    nextDistance += getDetailsBoxHeight(event);
  }
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

export const getStatusColor = (
  status: WorkflowStatus | EventClassification,
): string => {
  switch (status) {
    case 'Completed':
      return '#00f37e';
    case 'Failed':
    case 'Terminated':
      return '#ff4518';
    case 'Signaled':
      return '#d300d8';
    case 'Fired':
      return '#f8a208';
    case 'TimedOut':
      return '#c2570c';
    case 'Canceled':
      return '#fed64b';
    case 'Running':
      return '#3b82f6';
    default:
      return '#ffffff';
  }
};

export const activeRowsHeightAboveGroup = (
  activeGroups: string[],
  groupIndex: number,
  timeGroups: EventGroups[],
) => {
  let activeRowsHeight = 0;
  activeGroups.forEach((id) => {
    const activeTimeGroup = timeGroups.find((timeGroup) =>
      timeGroup.find((g) => g.id === id),
    );
    const activeGroup = activeTimeGroup.find((g) => g.id === id);
    const activeRowIndex = activeTimeGroup.indexOf(activeGroup);
    if (activeRowIndex < groupIndex) {
      activeRowsHeight += getDetailsBoxHeight(activeGroup);
    }
  });

  return activeRowsHeight;
};

export const activeGroupsHeightAboveGroup = (
  activeGroups: string[],
  group: EventGroup,
  groups: EventGroups,
) => {
  return activeGroups
    .filter((id) => {
      return parseInt(id) < parseInt(group.id);
    })
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getDetailsBoxHeight(group);
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

export const staticCodeBlockHeight = 200;

export const getDetailsBoxHeight = (
  groupOrEvent: EventGroup | WorkflowEvent,
) => {
  const attributes = mergeEventGroupDetails(groupOrEvent);
  const codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  const textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  const codeBlockHeight = codeBlockAttributes.length * staticCodeBlockHeight;
  const textHeight = textAttributes.length * DetailsConfig.fontSizeRatio;
  const totalTextHeight =
    groupOrEvent.category === 'child-workflow' && isEventGroup(groupOrEvent)
      ? textHeight + DetailsChildTimelineHeight
      : textHeight;
  return (
    Math.max(codeBlockHeight, totalTextHeight) + 3 * DetailsConfig.fontSizeRatio
  );
};
