<script context="module">
  export const compactGap = 24;
  export const gutterStart = 120;
  export const gutterEnd = 20;
</script>

<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import CompactLineDot from './compact-line-dot.svelte';
  import Line from './line.svelte';

  export let workflow: WorkflowExecution;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];

  export let canvasWidth: number = 1000;
  export let canvasHeight: number = 10;
  export let activeGroup: EventGroup;
  export let activeEvent: WorkflowEvent | 'input' | 'results' = 'input';
  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;

  $: startTime = workflow.startTime;
  $: endTime = workflow.isRunning ? Date.now() : workflow.endTime;
  $: fullDistance = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });
  $: finishingX = canvasWidth - gutterEnd;

  $: getDistance = (event: WorkflowEvent) => {
    const distance = getMillisecondDuration({
      start: startTime,
      end: new Date(event.timestamp),
      onlyUnderSecond: false,
    });

    return distance
      ? Math.round(
          (distance / fullDistance) * (canvasWidth - (gutterStart + gutterEnd)),
        )
      : 0;
  };

  $: getNextEventDistance = (
    event: WorkflowEvent,
    group: EventGroup,
  ): { x: number; nextX: number } => {
    const x = getDistance(event);
    let nextX = 0;

    if (group.eventList.length > 1) {
      const ids = Array.from(group.eventIds);
      const groupIndex = ids.indexOf(event.id);
      if (groupIndex < ids.length - 1) {
        nextX = getDistance(group.eventList[groupIndex + 1]) - x;
      }
    }
    return { x, nextX };
  };

  $: isActive = (event?: WorkflowEvent | PendingActivity): boolean => {
    if (activeGroup) {
      return activeGroup?.eventIds.has(event.id);
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };
</script>

<div
  style="width: {canvasWidth}px; min-width: {canvasWidth}px; height: {canvasHeight}px; min-height: {canvasHeight}px;"
>
  <svg height={canvasHeight} viewBox="0 0 {canvasWidth} {canvasHeight}">
    <Line x={gutterStart} y1={0} y2={canvasHeight} />
    <Line x={finishingX} y1={0} y2={canvasHeight} />
    {#each groups as group, index (group.id)}
      {#each group.eventList as event, i (event.id)}
        {@const { x, nextX } = getNextEventDistance(event, group)}
        <CompactLineDot
          y={(index + 1) * compactGap + compactGap / 2}
          x={gutterStart + x}
          {canvasWidth}
          {nextX}
          category={event.category}
          classification={event.classification}
          active={isActive(event)}
          onClick={() => onClick(group)}
          startText={i === 0
            ? capitalize(group?.label || group?.category || group?.name)
            : ''}
          endText={i === group.eventList.length - 1 ? group?.name : ''}
        />
      {/each}
    {/each}
    <slot />
  </svg>
</div>
