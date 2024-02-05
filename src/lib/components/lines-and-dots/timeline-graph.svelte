<script context="module">
  export const gap = 20;
  export const gutterStart = 100;
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

  export let canvasWidth = 1000;
  export let activeGroup: EventGroup;
  export let activeEvent: WorkflowEvent | 'input' | 'results' = 'input';
  export let onHover: (workflow: WorkflowEvent | PendingActivity) => void;

  $: canvasHeight = (groups.length + 2) * gap;
  $: startTime = workflow.startTime;
  $: endTime = workflow.isRunning ? Date.now() : workflow.endTime;
  $: fullDistance = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });
  $: finishingX = canvasWidth - gutterEnd;

  const getDistance = (event: WorkflowEvent) => {
    const distance = getMillisecondDuration({
      start: startTime,
      end: new Date(event.timestamp),
      onlyUnderSecond: false,
    });

    return Math.round(
      (distance / fullDistance) * (canvasWidth - (gutterStart + gutterEnd)),
    );
  };

  const getNextEventDistance = (
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

<div style="width: {canvasWidth}px; min-width: {canvasWidth}px;">
  <svg width={canvasWidth} viewBox="0 0 {canvasWidth} {canvasHeight}">
    <Line x={gutterStart} y1={0} y2={canvasHeight} />
    <Line x={finishingX} y1={0} y2={canvasHeight} />
    {#each groups as group, index (group.id)}
      {#each group.eventList as event, i (event.id)}
        {@const { x, nextX } = getNextEventDistance(event, group)}
        <CompactLineDot
          y={(index + 1) * gap + gap / 2}
          x={gutterStart + x}
          {canvasWidth}
          {nextX}
          category={event.category}
          classification={event.classification}
          active={isActive(event)}
          onHover={() => onHover(event)}
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
