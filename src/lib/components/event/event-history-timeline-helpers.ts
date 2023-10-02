import { get } from 'svelte/store';

import { timeFormat } from '$lib/stores/time-format';
import { formatDate } from '$lib/utilities/format-date';
import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

export const tooltipTemplate = (item, _parsedItems): string => {
  if (!item?.data?.eventList) return workflowExeuctionTooltipTemplate(item);
  if (item?.data.eventList.length === 1)
    return singleEventTooltipTemplate(item);
  return groupEventTooltipTemplate(item);
};

const workflowExeuctionTooltipTemplate = (item): string => {
  return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-16">Start</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-16">End</div>
    <div>${formatDate(item.end, get(timeFormat))}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-16">Duration</div><div>${formatDistanceAbbreviated(
    {
      start: item.start,
      end: item.end,
      includeMilliseconds: true,
    },
  )}</div>
  </div>
  </div>`;
};

const singleEventTooltipTemplate = (item): string => {
  return `<div class="flex flex-col gap-1">
  <div class="flex gap-2"><div class="font-bold w-16">Event Time</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
    </div>
  </div>`;
};

const groupEventTooltipTemplate = (item): string => {
  return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-16">Start</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-16">End</div>
    <div>${formatDate(item.end, get(timeFormat))}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-16">Duration</div><div>${formatDistanceAbbreviated(
    {
      start: item.start,
      end: item.end,
      includeMilliseconds: true,
    },
  )}</div>
  </div>
  </div>`;
};
