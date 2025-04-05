import type { EventSortOrder } from '$lib/stores/event-view';
import type { BooleanString } from '$lib/types/global';

type DateFilterOptions = {
  compact: boolean;
  sortOrder: EventSortOrder;
  showElapsed: BooleanString;
};

export const getDateFilterValue = ({
  compact,
  sortOrder,
  showElapsed,
}: DateFilterOptions) => {
  const isDefaultSortOrder = compact || sortOrder === 'descending';
  const isNotElapsedTime = showElapsed === 'false';
  const allDefaults = isDefaultSortOrder && isNotElapsedTime;

  if (allDefaults) {
    return undefined;
  }

  return `${sortOrder}:${showElapsed}`;
};
