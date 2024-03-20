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
  fontSizeRatio: baseRadius * 4,
};

export const TimelineConfig: GraphConfig = {
  height: baseRadius * 6,
  gutter: baseRadius * 3,
  radius: baseRadius * 2,
  fontSizeRatio: baseRadius * 4,
};

export const HistoryConfig: GraphConfig = {
  height: baseRadius * 4,
  gutter: baseRadius * 2,
  radius: baseRadius,
  fontSizeRatio: baseRadius * 2,
};

export const CategoryIcon = {
  workflow: 'workflow',
  signal: 'signal',
  command: 'sliders',
  activity: 'activity',
  marker: 'pin',
  timer: 'retention',
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
  return ids.indexOf(event.id) === 1;
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
  event: WorkflowEvent,
  groups: EventGroups,
  pendingActivity?: PendingActivity,
): number => {
  const group = groups.find((g) => g.eventIds.has(event.id));
  if (!group.pendingActivity && pendingActivity) {
    group.pendingActivity = pendingActivity;
  }
  if (group.level !== undefined) return group.level;

  const openGroups = groups.filter(
    (g) =>
      g.eventList.length > 1 &&
      !g.pendingActivity &&
      !g.eventIds.has(event.id) &&
      g.eventList.some((e) => parseInt(e.id) > parseInt(event.id)) &&
      parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
  );

  const pendingGroups = groups.filter(
    (g) =>
      !g.eventIds.has(event.id) &&
      g.pendingActivity &&
      parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
  );

  if (
    !openGroups.length &&
    !pendingGroups.length &&
    isConsecutiveGroup(group)
  ) {
    group.level = 0;
  }
  group.level = openGroups.length + pendingGroups.length + 2;
  return group.level;
};

export const getNextDistanceAndOffset = (
  history: WorkflowEvents,
  event: WorkflowEvent,
  index: number,
  groups: EventGroups,
  pendingActivities: PendingActivity[],
  height: number,
): { nextDistance: number; offset: number; y: number } => {
  let nextDistance = 0;
  let offset = 1;
  const y = (index + 1) * height + height / 2;

  const group = groups.find((g) => g.eventIds.has(event.id));
  if (!group) {
    return { nextDistance, offset, y };
  }

  const pendingActivity = group.pendingActivity;
  if (group.eventList.length === 1 && !pendingActivity) {
    return { nextDistance, offset, y };
  }

  const currentIndex = group.eventList.indexOf(event);
  const nextEvent = group.eventList[currentIndex + 1];
  offset = getOpenGroups(event, groups, pendingActivity);
  if (!nextEvent && !pendingActivity) {
    return { nextDistance, offset, y };
  }

  // TODO: Dont extend line when activity completes and there was a pending activity
  // if (!nextEvent && pendingActivity && group.eventList.length === 3) {
  //   return { nextDistance, offset, y };
  // }

  const diff = pendingActivity
    ? history.length -
      parseInt(event.id) +
      pendingActivities.indexOf(pendingActivity) +
      1
    : parseInt(nextEvent.id) - parseInt(event.id);
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

export const mergeEventGroupDetails = (group: EventGroup) => {
  const attributes = group.eventList.map((event) => formatAttributes(event));
  const attributesList = group.pendingActivity
    ? [formatPendingAttributes(group.pendingActivity), ...attributes]
    : attributes;
  return attributesList.reduce((acc, attribute) => {
    return { ...acc, ...attribute };
  }, {});
};

export const getEventDetailsHeight = (group: EventGroup, height: number) => {
  return Object.keys(mergeEventGroupDetails(group)).length * height + height;
};

export const getDetailsBoxHeight = (group: EventGroup, height: number) => {
  const detailsHeight = getEventDetailsHeight(group, height);
  return group.category === 'child-workflow'
    ? DetailsChildTimelineHeight + detailsHeight
    : detailsHeight;
};
