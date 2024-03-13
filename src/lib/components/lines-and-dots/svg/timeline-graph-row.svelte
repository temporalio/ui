<script lang="ts">
  // import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  // import { fetchAllEvents } from '$lib/services/events-service';
  // import { fetchWorkflow } from '$lib/services/workflow-service';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    formatDistanceAbbreviated,
    getMillisecondDuration,
  } from '$lib/utilities/format-time';

  import { DotIcon, TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let workflow: WorkflowExecution;
  export let group: EventGroup;
  export let index: number;

  export let canvasWidth: number;
  export let active = true;
  export let onClick: () => void;

  // $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  const onGroupClick = async () => {
    onClick();
    // if (group.category === 'child-workflow') {
    //   const { workflow } = await fetchWorkflow({
    //     namespace,
    //     workflowId,
    //     runId,
    //   });
    //   fetchAllEvents({ namespace, workflowId, runId, sort });
    // }
  };

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

  $: firstPoint = points[0];
  $: lastPoint = points[points.length - 1];
  $: textAtBeginning = firstPoint > timelineWidth / 3 && !group.pendingActivity;
  $: textAtEnd =
    timelineWidth - lastPoint > timelineWidth / 3 && !group.pendingActivity;
  $: textInMiddle = !textAtBeginning && !textAtEnd;
  $: position = textAtEnd ? 'start' : textInMiddle ? 'middle' : 'end';

  $: textPoint = [
    textAtEnd
      ? lastPoint + 1.5 * radius
      : textAtBeginning
      ? firstPoint - 1.5 * radius
      : firstPoint + 1.5 * radius,
    y + radius / 2,
  ] as [number, number];
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onGroupClick}
  on:keypress={onGroupClick}
  class="relative cursor-pointer"
  height={gap}
  transform="matrix(1 0 0 1 0 0)"
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
        scheduling={index === 0 &&
          group.lastEvent.classification === 'Completed'}
      />
    {/if}
    {#if !nextPoint && group.pendingActivity}
      <Line
        startPoint={[x, y]}
        endPoint={[canvasWidth - gutter, y]}
        category={group.pendingActivity.attempt > 1 ? 'retry' : 'pending'}
        classification={group.lastEvent.classification}
        {active}
        strokeWidth={radius * 2}
        strokeDasharray="3"
      />
    {/if}
    <Dot point={[x, y]} category={group.category} {active} r={radius} />
    <Icon
      name={DotIcon[group.category]}
      x={x - radius}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
    />
  {/each}
  {#if group.pendingActivity}
    <Dot
      point={[canvasWidth - gutter, y]}
      category="pending"
      {active}
      r={radius}
    />
    <Icon
      name="retry"
      x={canvasWidth - gutter - radius}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
      stroke={group.pendingActivity.attempt > 1 ? '#FF4518' : '#ffffff'}
    />
  {/if}
  <Text point={textPoint} category={group.category} {active} {position}>
    {group?.name}
    <tspan fill={textInMiddle ? '#ffffff' : '#aebed9'} font-size="12px"
      >{duration}</tspan
    >
  </Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
