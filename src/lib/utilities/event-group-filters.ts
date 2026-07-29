import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { EventClassification, EventTypeCategory } from '$lib/types/events';

import {
  isActivityTaskStartedEvent,
  isLocalActivityMarkerEvent,
} from './is-event-type';

export const filterableEventClassifications = [
  'Completed',
  'Failed',
  'TimedOut',
  'Canceled',
  'Terminated',
  'Signaled',
  'Fired',
] as const satisfies readonly EventClassification[];

const filterableClassificationSet: ReadonlySet<string> = new Set(
  filterableEventClassifications,
);

export const isFilterableClassification = (
  classification: string | undefined,
): classification is EventClassification =>
  Boolean(classification) &&
  filterableClassificationSet.has(classification as string);

export const eventGroupAttributes = [
  'pending',
  'retried',
  'completed-with-retries',
] as const;

export type EventGroupAttribute = (typeof eventGroupAttributes)[number];

export const isEventGroupAttribute = (
  value: string,
): value is EventGroupAttribute =>
  (eventGroupAttributes as readonly string[]).includes(value);

export const getGroupClassification = (
  group: EventGroup,
): EventClassification => {
  if (isLocalActivityMarkerEvent(group.initialEvent)) {
    return group.initialEvent.markerRecordedEventAttributes?.failure
      ? 'Failed'
      : 'Completed';
  }
  return group.finalClassification || group.classification;
};

export const getGroupAttempt = (group: EventGroup): number => {
  if (group.pendingActivity) return group.pendingActivity.attempt ?? 0;
  if (group.category !== 'activity') return 0;
  return (
    group.eventList.find(isActivityTaskStartedEvent)?.attributes?.attempt ?? 0
  );
};

export const isGroupRetried = (group: EventGroup): boolean =>
  getGroupAttempt(group) > 1;

export const isGroupCompletedWithRetries = (group: EventGroup): boolean =>
  isGroupRetried(group) && getGroupClassification(group) === 'Completed';

export const groupHasAttribute = (
  group: EventGroup,
  attribute: EventGroupAttribute,
): boolean => {
  switch (attribute) {
    case 'pending':
      return group.isPending;
    case 'retried':
      return isGroupRetried(group);
    case 'completed-with-retries':
      return isGroupCompletedWithRetries(group);
    default:
      return false;
  }
};

export type EventGroupFilters = {
  categories: EventTypeCategory[];
  classifications: EventClassification[];
  attributes: EventGroupAttribute[];
};

export const passesStatusFacet = (
  group: EventGroup,
  classifications: EventClassification[],
) => {
  const classification = getGroupClassification(group);
  if (!isFilterableClassification(classification)) return true;
  return classifications.includes(classification);
};

export const filterEventGroups = (
  groups: EventGroup[],
  { categories, classifications, attributes }: EventGroupFilters,
): EventGroup[] =>
  groups.filter(
    (group) =>
      categories.includes(group.category) &&
      passesStatusFacet(group, classifications) &&
      (!attributes.length ||
        attributes.some((attribute) => groupHasAttribute(group, attribute))),
  );

export const countBy = <I, T extends string>(
  items: readonly I[],
  key: (item: I) => T | undefined,
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const value = key(item);
    if (value) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
};
