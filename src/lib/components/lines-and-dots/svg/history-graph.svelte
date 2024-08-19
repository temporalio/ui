<script lang="ts">
  import { scrollTop } from '$lib/holocene/main-content-container.svelte';
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import {
    endIndex,
    indexPageSize,
    startIndex,
  } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEvents } from '$lib/types/events';

  import { getEventDetailsBoxHeight, HistoryConfig } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Line from './line.svelte';

  export let groups: EventGroups;
  export let history: WorkflowEvents;
  export let activeEvents: string[] = [];
  export let zoomLevel: number = 1;
  export let canvasWidth = 0;

  $: workflowTaskGroups = groupWorkflowTaskEvents(
    $filteredEventHistory,
    $eventFilterSort,
  );
  $: allGroups = [...workflowTaskGroups, ...groups];

  const { height, radius } = HistoryConfig;

  const setHistorySlice = (top: number) => {
    let scrollIndex = Math.round(top / height);

    if ($endIndex - scrollIndex < indexPageSize / 4) {
      $endIndex += indexPageSize;
    } else if ($startIndex > scrollIndex && scrollIndex < indexPageSize / 4) {
      $startIndex = 0;
    }
  };

  $: setHistorySlice($scrollTop);

  $: visibleHistory = history.slice($startIndex, $endIndex);

  $: activeDetailsHeight = activeEvents
    .map((id) => {
      const event = history.find((event) => event.id === id);
      const group = allGroups.find((group) => group.eventIds.has(id));
      if (group) {
        return group.eventList.reduce(
          (sum, event) =>
            (sum += getEventDetailsBoxHeight(event, group.pendingActivity)),
          0,
        );
      }
      return getEventDetailsBoxHeight(event);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = visibleHistory.length * height + activeDetailsHeight;
  $: visualWidth = canvasWidth - 1.5 * radius;
  // $: isWide = canvasWidth >= 960;
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight}
  width={canvasWidth}
>
  <Line
    startPoint={[visualWidth, height / 2]}
    endPoint={[visualWidth, canvasHeight]}
    strokeWidth={6}
  />
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight * zoomLevel}"
    height={canvasHeight}
    width={canvasWidth / zoomLevel}
  >
    {#each visibleHistory as event, index (event.id)}
      <HistoryGraphRowVisual
        {event}
        group={allGroups.find((g) => g.eventIds.has(event.id))}
        groups={allGroups}
        {history}
        canvasWidth={visualWidth}
        {zoomLevel}
        {index}
      />
    {/each}
  </svg>
</svg>
