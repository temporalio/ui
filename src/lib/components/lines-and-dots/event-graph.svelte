<script context="module">
  export const gap = 40;
</script>

<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';

  import DraggableLine from './draggable-line.svelte';
  import LineDot from './line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let activeGroup: EventGroup;

  let width = 150;

  const canvasY = gap * history.length;

  const isMiddleEvent = (event: WorkflowEvent): boolean => {
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group) return false;
    const ids = Array.from(group.eventIds);
    return ids.indexOf(event.id) === 1;
  };

  const pairIsConsecutive = (x: string, y: string) => {
    return parseInt(x) === parseInt(y) - 1;
  };

  const isConsecutiveGroup = (group: EventGroup): boolean => {
    const ids = Array.from(group.eventIds);
    if (ids.length === 1) return true;
    if (ids.length === 2) return pairIsConsecutive(ids[0], ids[1]);
    if (ids.length === 3) {
      return (
        pairIsConsecutive(ids[0], ids[1]) && pairIsConsecutive(ids[1], ids[2])
      );
    }
  };

  const getOpenGroups = (event: WorkflowEvent): number => {
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (group.level !== undefined) return group.level;
    const openGroups = groups.filter(
      (g) =>
        g.eventList.length > 1 &&
        !g.eventIds.has(event.id) &&
        g.eventList.some((e) => parseInt(e.id) > parseInt(event.id)) &&
        parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    );

    if (openGroups.length === 0 && isConsecutiveGroup(group)) {
      group.level = 0;
    }
    group.level = openGroups.length + 2;
  };

  const getNextDistanceAndOffset = (
    event: WorkflowEvent,
  ): { nextDistance: number; offset: number } => {
    let nextDistance = 0;
    let offset = 1;
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group || group.eventList.length === 1) {
      return { nextDistance, offset };
    }
    const currentIndex = group.eventList.indexOf(event);
    const nextEvent = group.eventList[currentIndex + 1];
    offset = getOpenGroups(event);
    if (!nextEvent) {
      return { nextDistance, offset };
    }
    const diff = parseInt(nextEvent.id) - parseInt(event.id);
    nextDistance = diff * gap;
    return { nextDistance, offset };
  };

  const onExpand = (x: number) => {
    width = x;
  };
</script>

<div class="overflow-auto" style="width: {width}px;">
  <svg width={1000} viewBox="0 0 1000 {canvasY}">
    <Line start={0} end={canvasY} />
    {#each history as event, index (event.id)}
      {@const { nextDistance, offset } = getNextDistanceAndOffset(event)}
      <LineDot
        y={index * gap + gap / 2}
        category={event.category}
        connectLine={!isMiddleEvent(event)}
        active={activeGroup ? activeGroup.eventIds.has(event.id) : true}
        {offset}
        {nextDistance}
      />
    {/each}
    <DraggableLine x={width} height={canvasY} {onExpand} />
  </svg>
</div>
