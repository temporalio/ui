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

  import {
    getEventDetailsBoxHeight,
    getVisualWidth,
    HistoryConfig,
  } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Line from './line.svelte';

  export let groups: EventGroups;
  export let activeEvents: string[] = [];
  export let zoomLevel: number = 1;

  let canvasWidth: number;

  $: workflowTaskGroups = groupWorkflowTaskEvents(
    $filteredEventHistory,
    $eventFilterSort,
  );
  $: allGroups = [...workflowTaskGroups, ...groups];
  $: history =
    $eventFilterSort === 'descending'
      ? [...$filteredEventHistory].reverse()
      : $filteredEventHistory;

  const { height } = HistoryConfig;

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
  $: visualWidth = getVisualWidth(history, allGroups, 110);
  // $: isWide = canvasWidth >= 960;
</script>

<div bind:clientWidth={canvasWidth}>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
    <Line
      startPoint={[visualWidth, 0]}
      endPoint={[visualWidth, canvasHeight]}
      strokeWidth={6}
    />
    <svg
      viewBox="0 0 {2 * canvasWidth} {canvasHeight * zoomLevel}"
      height={canvasHeight}
      width={(2 * canvasWidth) / zoomLevel}
    >
      {#each visibleHistory as event, index (event.id)}
        <HistoryGraphRowVisual
          {event}
          group={allGroups.find((g) => g.eventIds.has(event.id))}
          groups={allGroups}
          {history}
          canvasWidth={visualWidth}
          {activeEvents}
          {zoomLevel}
          {index}
        />
      {/each}
    </svg>
  </svg>
</div>
