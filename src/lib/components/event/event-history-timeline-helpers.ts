import { get } from 'svelte/store';

import { timeFormat } from '$lib/stores/time-format';
import { formatDate } from '$lib/utilities/format-date';
import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export const tooltipTemplate = (item, _parsedItems): string => {
  if (!item?.data?.eventList) {
    return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-12">Start</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-12">End</div>
    <div>${formatDate(item.end, get(timeFormat))}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-12">Duration</div><div>${formatDistanceAbbreviated(
    {
      start: item.start,
      end: item.end,
      includeMilliseconds: true,
    },
  )}</div>
  </div>
  </div>`;
  } else if (item?.data?.eventList.length === 1) {
    return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-12">Start</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-12">End</div>
    <div>${formatDate(item.end, get(timeFormat))}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-12">Input</div><div>${stringifyWithBigInt(
    item?.data?.eventList[0]?.attributes?.input,
  )}</div>
  </div>
  </div>`;
  }
  return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-12">Start</div>
      <div>${formatDate(item.start, get(timeFormat))}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-12">End</div>
    <div>${formatDate(item.end, get(timeFormat))}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-12">Duration</div><div>${formatDistanceAbbreviated(
    {
      start: item.start,
      end: item.end,
      includeMilliseconds: true,
    },
  )}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-12">Input</div><div>${stringifyWithBigInt(
    item?.data?.eventList[0]?.attributes?.input,
  )}</div>
  </div>
  <div class="flex gap-2"><div class="font-bold w-12">Results</div><div>${stringifyWithBigInt(
    item?.data?.eventList[item.data.eventList.length - 1]?.attributes?.result,
  )}</div>
  </div>
  </div>`;
};
