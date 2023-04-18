import type { EventSortOrder } from '$lib/stores/event-view';
import type { BooleanString } from '$lib/types/global';

type DateFilterOptions = {
  compact: boolean;
  timeFormat: string;
  sortOrder: EventSortOrder;
  showElapsed: BooleanString;
};

export const getDateFilterValue = ({
  compact,
  timeFormat,
  sortOrder,
  showElapsed,
}: DateFilterOptions) => {
  const isDefaultSortOrder = compact || sortOrder === 'descending';
  const isDefaultTimeFormat = timeFormat === 'UTC';
  const isNotElapsedTime = showElapsed === 'false';
  const allDefaults =
    isDefaultSortOrder && isDefaultTimeFormat && isNotElapsedTime;

  if (allDefaults) {
    return undefined;
  }

  return `${sortOrder}:${timeFormat}:${showElapsed}`;
};
