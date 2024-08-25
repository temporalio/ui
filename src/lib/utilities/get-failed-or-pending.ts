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
      (isEventGroup(item) &&
        (item.isPending || item.finalClassification === 'Failed')) ||
      isPendingActivity(item) ||
      isPendingNexusOperation(item),
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
      item.eventList.length > 1 &&
      (item.isPending || item.finalClassification === 'Failed'),
  );
};
