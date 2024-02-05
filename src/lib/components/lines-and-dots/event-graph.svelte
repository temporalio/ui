<script context="module">
  export const gap = 40;
  export const startingX = 40;
</script>

<script lang="ts">
  import { noop } from 'svelte/internal';

  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type {
    PendingActivity,
    WorkflowEvent,
    WorkflowEvents,
  } from '$lib/types/events';

  import LineDot from './line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let canvasHeight = 1000;
  export let canvasWidth = 150;
  export let activeGroup: EventGroup;
  export let activeEvent: WorkflowEvent | 'input' | 'results' = 'input';
  export let compact = false;
  export let onHover: (workflow: WorkflowEvent) => void;

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
    index: number,
  ): { nextDistance: number; offset: number; y: number } => {
    let nextDistance = 0;
    let offset = 1;
    let y = (index + 1) * gap + gap / 2;

    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group || group.eventList.length === 1) {
      return { nextDistance, offset, y };
    }
    const currentIndex = group.eventList.indexOf(event);
    const nextEvent = group.eventList[currentIndex + 1];
    offset = getOpenGroups(event);
    if (!nextEvent) {
      return { nextDistance, offset, y };
    }
    const diff = parseInt(nextEvent.id) - parseInt(event.id);
    nextDistance = diff * gap;
    return { nextDistance, offset, y };
  };

  $: isActive = (event?: WorkflowEvent): boolean => {
    if (activeGroup) {
      return activeGroup?.eventIds.has(event.id);
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };

  $: isGroupActive = (group?: EventGroup): boolean => {
    if (activeGroup) {
      return activeGroup.id === group.id;
    }
    return true;
  };
</script>

<div style="width: {canvasWidth}px; min-width: {canvasWidth}px;">
  <svg width={1000} viewBox="0 0 1000 {canvasHeight}">
    <Line y1={0} y2={canvasHeight} />
    {#if compact}
      {#each groups as group, index (group.id)}
        <LineDot
          y={(index + 1) * gap + gap / 2}
          offset={0}
          nextDistance={0}
          {compact}
          category={group.category}
          classification={group.classification}
          connectLine={false}
          active={isGroupActive(group)}
          onHover={noop}
        />
      {/each}
    {:else}
      {#each history as event, index (event.id)}
        {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
          event,
          index,
        )}
        <LineDot
          {y}
          {offset}
          {nextDistance}
          {compact}
          category={event.category}
          classification={event.classification}
          connectLine={!isMiddleEvent(event)}
          active={isActive(event)}
          onHover={() => onHover(event)}
        />
      {/each}
      {#each pendingActivities as pendingActivity, index}
        <LineDot
          y={(history.length + index + 1) * gap + gap / 2}
          offset={0}
          nextDistance={0}
          category="pending"
          active={isActive(pendingActivity)}
          onHover={() => onHover(pendingActivity)}
        />
      {/each}
    {/if}
    <slot />
  </svg>
</div>
