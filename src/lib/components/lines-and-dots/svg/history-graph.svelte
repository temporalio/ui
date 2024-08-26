<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEventWithPending } from '$lib/types/events';
  import { getGroupForEventOrPendingEvent } from '$lib/utilities/pending-activities';

  import { getNextDistanceAndOffset, HistoryConfig } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Line from './line.svelte';

  export let groups: EventGroups;
  export let history: WorkflowEventWithPending[];

  $: workflowTaskGroups = groupWorkflowTaskEvents(
    $filteredEventHistory,
    $eventFilterSort,
  );
  $: allGroups = [...workflowTaskGroups, ...groups];

  const { height, radius } = HistoryConfig;

  const nodeBuffer = 4 * radius;
  const maxWidth = 300;

  let canvasWidth = nodeBuffer;
  let visualWidth = 0;

  $: canvasHeight = history.length * height;

  $: getMaxWidth = (items: WorkflowEventWithPending[]) => {
    items.forEach((event) => {
      const { offset } = getNextDistanceAndOffset(
        history,
        event,
        groups,
        height,
        $eventFilterSort,
      );
      canvasWidth = Math.max(canvasWidth, offset * 1.75 * radius + nodeBuffer);
      visualWidth = Math.min(canvasWidth - 2 * radius, maxWidth);
    });
  };

  $: getMaxWidth(history);
</script>

<div
  class="hidden text-right md:block"
  style="width: {canvasWidth}px; max-width: {maxWidth}px;"
  class:overflow-hidden={canvasWidth > maxWidth}
>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
    <Line
      startPoint={[visualWidth, 0]}
      endPoint={[visualWidth, canvasHeight]}
      strokeWidth={3}
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
