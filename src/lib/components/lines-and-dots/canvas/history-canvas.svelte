<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type {
    PendingActivity,
    WorkflowEvent,
    WorkflowEvents,
  } from '$lib/types/events';

  import {
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
  } from '../constants';
  import DetailsDrawer from '../details-drawer.svelte';

  import Canvas from './canvas.svelte';
  import Dot from './dot.svelte';
  import Line from './line.svelte';
  // import Rectangle from './rectangle.svelte';
  import Text from './text.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | undefined = undefined;
  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;
  export let clearActive: () => void;

  const { gap } = HistoryConfig;

  let canvasWidth = 1000;
  $: canvasHeight = Math.max(
    gap * 2 + gap * (history.length + pendingActivities.length),
    400,
  );
</script>

<div class="relative flex h-auto max-h-[800px] w-full gap-0 overflow-auto">
  <div
    class="relative h-full {activeEvent
      ? 'w-1/2'
      : 'w-full'} overflow-auto bg-slate-950"
    bind:clientWidth={canvasWidth}
  >
    <Canvas width={canvasWidth} height={canvasHeight}>
      <Line
        x1={canvasWidth / 2}
        x2={canvasWidth / 2}
        y1={0}
        y2={canvasHeight}
      />
      {#each history as event, index (event.id)}
        {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
          history,
          event,
          index,
          groups,
          pendingActivities,
          gap,
        )}
        <Text x={5} y={y + 5} {event} {onClick} />
        <Dot
          {canvasWidth}
          {event}
          {y}
          {offset}
          {nextDistance}
          category={event.category}
          connectLine={!isMiddleEvent(event, groups)}
          {onClick}
        />
        <!-- {#if index % 2 === 1}
          <Rectangle
            x={0}
            y={y - gap / 2}
            width={canvasWidth / 2}
            height={gap}
          />
        {/if} -->
      {/each}
      {#each pendingActivities as event, index}
        {@const y = (history.length + index + 1) * gap + gap / 2}
        <Text x={50} y={y + 5} {onClick} {event} />
        <Dot
          {canvasWidth}
          {event}
          {y}
          offset={groups.find((g) => g?.pendingActivity === event)?.level || 1}
          nextDistance={0}
          category="pending"
          {onClick}
        />
      {/each}
    </Canvas>
  </div>
  {#if activeEvent}
    <div class="sticky top-0 w-1/2">
      <DetailsDrawer
        {activeEvent}
        {activeGroup}
        {clearActive}
        compact={false}
      />
    </div>
  {/if}
</div>
