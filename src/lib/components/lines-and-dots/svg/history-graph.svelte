<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEventWithPending } from '$lib/types/events';
  import { getGroupForEventOrPendingEvent } from '$lib/utilities/pending-activities';

  import { HistoryConfig } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Line from './line.svelte';

  export let groups: EventGroups;
  export let history: WorkflowEventWithPending[];
  export let zoomLevel: number = 1;
  export let canvasWidth = 100;

  $: workflowTaskGroups = groupWorkflowTaskEvents(
    $filteredEventHistory,
    $eventFilterSort,
  );
  $: allGroups = [...workflowTaskGroups, ...groups];

  const { height, radius } = HistoryConfig;

  $: canvasHeight = history.length * height;
  $: visualWidth = canvasWidth - 1.5 * radius;
  $: reverseSort = $eventFilterSort === 'descending';
</script>

<div class="hidden md:block" style="min-width: {canvasWidth}px">
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
    <Line
      startPoint={[visualWidth, reverseSort ? 0 : height / 2]}
      endPoint={[
        visualWidth,
        reverseSort ? canvasHeight - height / 2 : canvasHeight,
      ]}
      strokeWidth={6}
    />
    <svg
      viewBox="0 0 {canvasWidth} {canvasHeight * zoomLevel}"
      height={canvasHeight}
      width={canvasWidth / zoomLevel}
    >
      {#each history as event, index}
        {@const group = getGroupForEventOrPendingEvent(allGroups, event)}
        <HistoryGraphRowVisual
          {event}
          {group}
          groups={allGroups}
          {history}
          canvasWidth={visualWidth}
          {zoomLevel}
          {index}
        />
      {/each}
    </svg>
  </svg>
</div>
