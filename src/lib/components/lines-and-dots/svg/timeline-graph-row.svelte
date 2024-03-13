<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    formatDistanceAbbreviated,
    getMillisecondDuration,
  } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let workflow: WorkflowExecution;
  export let group: EventGroup;
  export let index: number;

  export let canvasWidth: number;
  export let active = true;
  export let onClick: () => void;

  const { gap, gutter, radius } = TimelineConfig;

  $: y = (index + 1) * gap + gap / 2;

  $: startTime = $fullEventHistory[0]?.eventTime || workflow.startTime;
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

  $: lastPoint = points[points.length - 1];
  $: textAtEnd = timelineWidth - lastPoint > group?.name?.length * 9 ?? 200;
  $: textPoint = [
    textAtEnd ? lastPoint + radius : points[0] - radius,
    y + radius / 2,
  ];
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
>
  {#each points as x, index}
    {@const nextPoint = points[index + 1]}
    {#if nextPoint}
      <Line
        startPoint={[x, y]}
        endPoint={[nextPoint, y]}
        category={group.category}
        classification={group.lastEvent.classification}
        {active}
        strokeWidth={radius * 2}
        initiated={index === 0}
      />
    {/if}
    {#if !nextPoint && group.pendingActivity}
      <Line
        startPoint={[x, y]}
        endPoint={[canvasWidth - gutter, y]}
        category={group.category}
        classification={group.lastEvent.classification}
        {active}
        strokeWidth={radius * 2}
        initiated={index === 0}
        strokeDasharray="3"
      />
    {/if}
    <Dot point={[x, y]} category={group.category} {active} r={radius} />
  {/each}
  {#if group.pendingActivity}
    <Dot
      point={[canvasWidth - gutter, y]}
      category="pending"
      {active}
      r={radius}
    />
  {/if}
  <Text
    point={textPoint}
    category={group.category}
    {active}
    textAnchor={textAtEnd ? 'start' : 'end'}
  >
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
