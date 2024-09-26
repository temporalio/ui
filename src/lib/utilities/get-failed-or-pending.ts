import { isEventGroup } from '$lib/models/event-groups';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { isEvent } from '$lib/models/event-history';
import type { IterableEventWithPending } from '$lib/types/events';

import {
  isPendingActivity,
  isPendingNexusOperation,
} from './is-pending-activity';

export const getFailedOrPendingEvents = (
  items: IterableEventWithPending[],
  filterForFailedOrPending: boolean,
) => {
  if (!filterForFailedOrPending) return items;
  return items.filter(
    (item) =>
      (isEvent(item) && item.classification === 'Failed') ||
      (isEvent(item) && item.classification === 'TimedOut') ||
      isPendingActivity(item) ||
      isPendingNexusOperation(item) ||
      (isEventGroup(item) &&
        (item.isPending ||
          item.finalClassification === 'Failed' ||
          item.finalClassification === 'TimedOut')),
  );
};

export const getFailedOrPendingGroups = (
  items: EventGroup[],
  filterForFailedOrPending: boolean,
) => {
  if (!filterForFailedOrPending) return items;
  return items.filter(
    (item) =>
      isEventGroup(item) &&
      (item.isPending ||
        item.finalClassification === 'Failed' ||
        item.finalClassification === 'TimedOut'),
  );
};
