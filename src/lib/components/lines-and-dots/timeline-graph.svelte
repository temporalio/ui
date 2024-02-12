<script context="module">
  export const compactGap = 24;
  export const gutterStart = 20;
  export const gutterEnd = 20;
</script>

<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import CompactLineDot from './compact-line-dot.svelte';
  import DetailsDrawer from './details-drawer.svelte';
  import Line from './line.svelte';

  export let workflow: WorkflowExecution;
  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | undefined = undefined;
  export let onClick: (event: EventGroup) => void;
  export let clearActive: () => void;

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

    return Math.round(
      (distance / fullDistance) * (canvasWidth - (gutterStart + gutterEnd)),
    );
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
    } else if (group.pendingActivity) {
      nextX = finishingX - x;
    }

    return { x, nextX };
  };

  $: isActive = (event?: WorkflowEvent | PendingActivity): boolean => {
    if (activeGroup) {
      return (
        activeGroup?.eventIds.has(event.id) ||
        activeGroup?.pendingActivity?.id === event.id
      );
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };

  let canvasWidth = 1000;
  $: canvasHeight = Math.max(compactGap * 2 + compactGap * groups.length, 200);
</script>

<div class="relative w-full bg-slate-950" bind:clientWidth={canvasWidth}>
  <svg class="w-full" viewBox="0 0 {canvasWidth} {canvasHeight}">
    <Line x={gutterStart} y1={0} y2={canvasHeight} />
    <Line x={finishingX} y1={0} y2={canvasHeight} status={workflow.status} />
    {#each groups as group, index (group.id)}
      {#each group.eventList as event (event.id)}
        {@const { x, nextX } = getNextEventDistance(event, group)}
        <CompactLineDot
          {group}
          {event}
          y={(index + 1) * compactGap + compactGap / 2}
          x={gutterStart + x}
          {canvasWidth}
          {nextX}
          category={event.category}
          classification={event.classification}
          active={isActive(event)}
          onClick={() => onClick(group)}
        />
      {/each}
      {#if group.pendingActivity}
        <CompactLineDot
          {group}
          event={group.pendingActivity}
          y={(index + 1) * compactGap + compactGap / 2}
          x={finishingX}
          {canvasWidth}
          category="pending"
          classification={group.classification}
          active={isActive(group.pendingActivity)}
          onClick={() => onClick(group)}
        />
      {/if}
    {/each}
  </svg>
  {#if activeGroup}
    <DetailsDrawer
      {canvasHeight}
      {activeEvent}
      {activeGroup}
      {clearActive}
      compact
    />
  {/if}
</div>
