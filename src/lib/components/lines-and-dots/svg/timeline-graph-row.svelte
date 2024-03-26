<script lang="ts">
  import type { Timestamp } from '@temporalio/common';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    formatDistanceAbbreviated,
    getMillisecondDuration,
  } from '$lib/utilities/format-time';

  import { CategoryIcon, isPendingGroup, TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let y = 0;
  export let workflow: WorkflowExecution;
  export let group: EventGroup;
  export let activeGroups: string[] = [];
  export let startTime: string | Timestamp;
  export let canvasWidth: number;
  export let active = true;
  export let onClick: () => void;

  const { height, gutter, radius } = TimelineConfig;

  $: endTime = workflow.isRunning ? Date.now() : workflow.endTime;
  $: workflowDistance = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });
  $: timelineWidth = canvasWidth - 2 * gutter;

  $: points = group.eventList.map((event) => {
    const distance = getMillisecondDuration({
      start: startTime,
      end: event.eventTime,
      onlyUnderSecond: false,
    });

    const ratio = distance / workflowDistance;
    return Math.round(ratio * timelineWidth) + gutter;
  });

  $: duration = formatDistanceAbbreviated({
    start: group.initialEvent.eventTime,
    end: group.lastEvent.eventTime,
    includeMilliseconds: true,
  });

  $: firstPoint = points[0];
  $: lastPoint = points[points.length - 1];
  $: startsNearTheEnd = firstPoint > (3 / 4) * timelineWidth;
  $: textAnchor = startsNearTheEnd ? 'end' : 'start';
  $: textPosition = startsNearTheEnd
    ? lastPoint + radius / 2
    : firstPoint + radius / 3;
  $: isPending = isPendingGroup(group);
  $: active = !activeGroups.length || activeGroups.includes(group.id);
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  {height}
>
  {#each points as x, index}
    {@const nextPoint = points[index + 1]}
    {@const showIcon = index === 0}
    {#if nextPoint}
      <Line
        startPoint={[x, y]}
        endPoint={[nextPoint, y]}
        category={group.category}
        classification={group.lastEvent.classification}
        {active}
        strokeWidth={radius * 2}
        scheduling={index === 0 &&
          group.lastEvent.classification === 'Completed'}
      />
    {/if}
    {#if !nextPoint && isPending}
      <Line
        startPoint={[x, y]}
        endPoint={[canvasWidth - gutter, y]}
        category={group?.pendingActivity
          ? group?.pendingActivity.attempt > 1
            ? 'retry'
            : 'pending'
          : group.category}
        classification={group.lastEvent.classification}
        {active}
        pending
        strokeWidth={radius * 2}
      />
    {/if}
    <Dot
      point={[x, y]}
      classification={group.eventList[index]?.classification}
      {active}
      r={radius}
    />
    {#if showIcon}
      <Icon
        name={CategoryIcon[group.category]}
        x={x - radius}
        y={y - radius}
        width={radius * 2}
        height={radius * 2}
        strokeWidth="4"
        class="text-black"
      />
    {/if}
  {/each}
  <Text point={[textPosition, y - radius - radius / 3]} {active} {textAnchor}>
    {group?.name}
    <tspan fill="#aebed9" font-size="12px">{duration}</tspan>
  </Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
