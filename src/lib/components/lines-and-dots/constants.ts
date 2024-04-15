import type { IconName } from '$lib/holocene/icon';
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
  formatGroupAttributes,
  formatPendingAttributes,
} from '$lib/utilities/format-event-attributes';
import { isAssociatedPendingActivity } from '$lib/utilities/pending-activities';

export const DetailsChildTimelineHeight = 200;

export type GraphConfig = {
  height: number;
  gutter: number;
  radius: number;
  fontSizeRatio: number;
};

const baseRadius = 6;

export const minCompactWidth = 200;

export const CompactConfig: GraphConfig = {
  height: baseRadius * 9,
  gutter: baseRadius * 7,
  radius: baseRadius * 4,
  fontSizeRatio: baseRadius * 4,
};

export const TimelineConfig: GraphConfig = {
  height: baseRadius * 5,
  gutter: baseRadius * 4,
  radius: baseRadius * 2,
  fontSizeRatio: baseRadius * 4,
};

export const HistoryConfig: GraphConfig = {
  height: baseRadius * 5,
  gutter: baseRadius * 2,
  radius: baseRadius * 1.333,
  fontSizeRatio: baseRadius * 4,
};

export const DetailsConfig: GraphConfig = {
  height: baseRadius * 4,
  gutter: baseRadius * 3,
  radius: baseRadius,
  fontSizeRatio: baseRadius * 4,
};

export const CategoryIcon: Record<EventTypeCategory, IconName> = {
  workflow: 'workflow',
  signal: 'signal',
  command: 'sliders',
  activity: 'activity',
  marker: 'marker',
  timer: 'retention',
  'local-activity': 'feather',
  'child-workflow': 'relationship',
  update: 'update',
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
): number => {
  const group = groups.find((g) => g.eventIds.has(event.id));
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
  group.level = openGroups.length + 1;
  return group.level;
};

const allEventsInGroupHeight = (
  id: string,
  history: WorkflowEvents,
  groups: EventGroups,
): number => {
  const event = history.find((event) => event.id === id);
  const group = groups.find((group) => group.eventIds.has(id));
  if (group) {
    return group.eventList.reduce(
      (sum, event) =>
        (sum += getEventDetailsBoxHeight(event, group.pendingActivity)),
      0,
    );
  }
  if (event) return getEventDetailsBoxHeight(event);
  return 0;
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
      return allEventsInGroupHeight(id, history, groups);
    })
    .reduce((acc, height) => acc + height, 0);
};

export const getVisualWidth = (
  history: WorkflowEvents,
  groups: EventGroups,
  maxWidth: number,
) => {
  let maxOffset = 0;
  if (!history.length) return maxWidth;
  history.forEach((event) => {
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (group) {
      const offset = getOpenGroups(event, groups);
      if (offset > maxOffset) {
        maxOffset = offset;
      }
    }
  });
  return Math.min(maxWidth, (maxOffset + 2) * 2 * HistoryConfig.radius);
};

export const getNextDistanceAndOffset = (
  history: WorkflowEvents,
  event: WorkflowEvent,
  groups: EventGroups,
  height: number,
): { nextDistance: number; offset: number } => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  let nextDistance = 0;
  let offset = 0;

  if (!group) {
    return { nextDistance, offset };
  }

  if (group.eventList.length === 1 && !group.isPending) {
    return { nextDistance, offset };
  }

  const currentIndex = group.eventList.indexOf(event);
  const nextEvent = group.eventList[currentIndex + 1];
  if (event.category !== 'workflow') {
    offset = getOpenGroups(event, groups);
  }

  if (!nextEvent && !group.isPending) {
    return { nextDistance, offset };
  }

  let diff = 0;
  if (nextEvent) {
    diff = parseInt(nextEvent.id) - parseInt(event.id);
  } else if (group.isPending) {
    diff = history.length - parseInt(event.id) + 2;
  }
  nextDistance = diff * height;
  return { nextDistance, offset };
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
  status: WorkflowStatus | EventClassification | 'Pending' | 'Retrying',
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
      return '#F97316';
    case 'Canceled':
      return '#fed64b';
    case 'Running':
      return '#3b82f6';
    case 'Pending':
      return '#a78bfa';
    case 'Retrying':
      return '#FF9B70';
    default:
      return '#ffffff';
  }
};

export const activeGroupsHeightAboveGroup = (
  activeGroups: string[],
  group: EventGroup,
  groups: EventGroups,
  width: number,
) => {
  return activeGroups
    .filter((id) => {
      return parseInt(id) < parseInt(group.id);
    })
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getGroupDetailsBoxHeight(group, width);
    })
    .reduce((acc, height) => acc + height, 0);
};

export const mergeEventGroupDetails = (group: EventGroup) => {
  const attributes = formatGroupAttributes(group);
  return group.pendingActivity
    ? { ...formatPendingAttributes(group.pendingActivity), ...attributes }
    : attributes;
};

export const staticCodeBlockHeight = 200;

export const getGroupDetailsBoxHeight = (group: EventGroup, width: number) => {
  const isWide = width >= 960;
  const attributes = mergeEventGroupDetails(group);
  const codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  const textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  const codeBlockHeight = codeBlockAttributes.length * staticCodeBlockHeight;
  const textHeight =
    (isWide ? 1 : 2) * textAttributes.length * DetailsConfig.fontSizeRatio;
  const totalTextHeight =
    group.category === 'child-workflow'
      ? textHeight + DetailsChildTimelineHeight
      : textHeight;
  return (
    Math.max(codeBlockHeight, totalTextHeight) + 3 * DetailsConfig.fontSizeRatio
  );
};

export const getEventDetailsBoxHeight = (
  event: WorkflowEvent,
  pendingActivity?: PendingActivity,
) => {
  const attributes = formatAttributes(event);
  const codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  const textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  let pendingActivityHeight = 0;
  if (isAssociatedPendingActivity(event, pendingActivity)) {
    pendingActivityHeight = getPendingEventDetailHeight(pendingActivity);
  }
  const codeBlockHeight = codeBlockAttributes.length * staticCodeBlockHeight;
  const textHeight = textAttributes.length * DetailsConfig.fontSizeRatio;
  return (
    pendingActivityHeight +
    codeBlockHeight +
    textHeight +
    +2 * DetailsConfig.fontSizeRatio
  );
};

export const getPendingEventDetailHeight = (event: PendingActivity) => {
  const textHeight = 5 * DetailsConfig.fontSizeRatio;
  let codeBlockHeight = 0;
  if (event?.heartbeatDetails) codeBlockHeight += staticCodeBlockHeight;
  if (event?.lastFailure) codeBlockHeight += staticCodeBlockHeight;
  return codeBlockHeight + textHeight + 2 * DetailsConfig.fontSizeRatio;
};
