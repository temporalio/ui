import { get } from 'svelte/store';

import { endOfMinute, startOfMinute } from 'date-fns';
import type { TimelineOptionsZoomKey } from 'vis-timeline';

import { relativeTime, timeFormat } from '$lib/stores/time-format';
import type { WorkflowExecution } from '$lib/types/workflows';
import { formatDate } from '$lib/utilities/format-date';
import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

type TimelineOptionsTooltipOverflow = 'flip' | 'none' | 'cap';

export const getTimelineOptions = (workflow: WorkflowExecution) => ({
  stackSubgroups: true,
  maxHeight: 300,
  min: startOfMinute(new Date(workflow.startTime)),
  max: workflow?.endTime
    ? endOfMinute(new Date(workflow?.endTime))
    : Date.now(),
  horizontalScroll: true,
  verticalScroll: true,
  zoomKey: 'ctrlKey' as TimelineOptionsZoomKey,
  orientation: {
    // axis: 'both',
    item: 'center',
  },
  tooltip: {
    delay: 0,
    overflowMethod: 'flip' as TimelineOptionsTooltipOverflow,
    followMouse: false,
    template: tooltipTemplate,
  },
  rollingMode: {
    follow: false,
  },
  format: {
    majorLabels: {
      millisecond: 'D MMMM HH:mm:ss',
      second: 'D MMMM HH:mm',
      minute: 'ddd D MMMM',
      hour: 'ddd D MMMM',
      weekday: 'MMMM YYYY',
      day: 'MMMM YYYY',
      week: 'MMMM YYYY',
      month: 'YYYY',
      year: '',
    },
  },
  xss: {
    disabled: true,
    filterOptions: {
      whiteList: {
        div: ['class'],
      },
    },
  },
});

export const tooltipTemplate = (item, _parsedItems): string => {
  if (!item?.data?.eventList) return workflowExecutionTooltipTemplate(item);
  if (item?.data.eventList.length === 1)
    return singleEventTooltipTemplate(item);
  return groupEventTooltipTemplate(item);
};

const workflowExecutionTooltipTemplate = (item): string => {
  return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-16">Start</div>
      <div>${formatDate(item.start, get(timeFormat), {
        relative: get(relativeTime),
      })}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-16">End</div>
    <div>${formatDate(item.end, get(timeFormat), {
      relative: get(relativeTime),
    })}</div>
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
      <div>${formatDate(item.start, get(timeFormat), {
        relative: get(relativeTime),
      })}
      </div>
    </div>
    </div>
  </div>`;
};

const groupEventTooltipTemplate = (item): string => {
  return `<div class="flex flex-col gap-1">
    <div class="flex gap-2"><div class="font-bold w-16">Start</div>
      <div>${formatDate(item.start, get(timeFormat), {
        relative: get(relativeTime),
      })}
      </div>
    </div>
  <div class="flex gap-2">
    <div class="font-bold w-16">End</div>
    <div>${formatDate(item.end, get(timeFormat), {
      relative: get(relativeTime),
    })}</div>
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
