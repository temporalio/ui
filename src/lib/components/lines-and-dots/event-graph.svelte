<script context="module">
  export const gap = 36;
</script>

<script lang="ts">
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';

  import LineDot from './line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;

  export let canvasX = 100;

  const canvasY = gap * history.length;

  // const getNextDistance = () => {};

  const getNextDistanceAndOffset = (
    event: WorkflowEvent,
  ): { nextDistance: number; offset: number } => {
    let nextDistance = 0;
    let offset = 0;
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group || group.eventList.length === 1) {
      return { nextDistance, offset };
    }
    const currentIndex = group.eventList.indexOf(event);
    const nextEvent = group.eventList[currentIndex + 1];
    if (!nextEvent) {
      return { nextDistance, offset };
    }
    const diff = parseInt(nextEvent.id) - parseInt(event.id);
    nextDistance = diff * gap;
    return { nextDistance, offset };
  };
</script>

<div class="w-[{canvasX}px] min-w-[{canvasX}px]">
  <svg width={canvasX} viewBox="0 0 {canvasX} {canvasY}">
    <Line {canvasX} start={0} end={canvasY} />
    {#each history as event, index (event.id)}
      {@const { nextDistance } = getNextDistanceAndOffset(event)}
      <LineDot
        y={index * gap + gap / 2}
        category={event.category}
        {canvasX}
        {nextDistance}
      />
    {/each}
  </svg>
</div>
