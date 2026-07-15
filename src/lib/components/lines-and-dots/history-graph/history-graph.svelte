<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEventWithPending } from '$lib/types/events';
  import { getGroupForEventOrPendingEvent } from '$lib/utilities/pending-activities';

  import { RADIUS, ROW_HEIGHT } from './constants';
  import { getNextDistanceAndOffset } from './positioning';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';

  interface Props {
    groups: EventGroups;
    history: WorkflowEventWithPending[];
  }

  let { groups, history }: Props = $props();

  const workflowTaskGroups = $derived(
    groupWorkflowTaskEvents($filteredEventHistory, $eventFilterSort),
  );
  const allGroups = $derived([...workflowTaskGroups, ...groups]);

  const nodeBuffer = 4 * RADIUS;
  const maxWidth = 600;

  const canvasWidth = $derived.by(() => {
    let width = nodeBuffer;
    history.forEach((event) => {
      const { offset } = getNextDistanceAndOffset(
        history,
        event,
        groups,
        ROW_HEIGHT,
        $eventFilterSort,
      );
      width = Math.max(width, offset * 1.75 * RADIUS + nodeBuffer);
    });
    return width;
  });
  const visualWidth = $derived(Math.min(canvasWidth - 2 * RADIUS, maxWidth));

  const canvasHeight = $derived(history.length * ROW_HEIGHT);
</script>

<div
  class="hidden text-right xl:block"
  style:width="{canvasWidth}px"
  style:max-width="{maxWidth}px"
  class:overflow-hidden={canvasWidth > maxWidth}
>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
    <line
      stroke="currentColor"
      stroke-width={3}
      x1={visualWidth}
      x2={visualWidth}
      y1={0}
      y2={canvasHeight}
    />
    <svg
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
    >
      {#each history as event, index}
        {@const group = getGroupForEventOrPendingEvent(allGroups, event)}
        <HistoryGraphRowVisual
          {event}
          {group}
          groups={allGroups}
          {history}
          canvasWidth={visualWidth}
          {index}
        />
      {/each}
    </svg>
  </svg>
</div>
