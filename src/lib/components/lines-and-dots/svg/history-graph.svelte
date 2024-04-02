<script lang="ts">
  import { scrollTop } from '$lib/holocene/main-content-container.svelte';
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import {
    endIndex,
    indexPageSize,
    startIndex,
  } from '$lib/stores/active-events';
  import type { WorkflowEvents } from '$lib/types/events';

  import { getDetailsBoxHeight, HistoryConfig } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import HistoryGraphRow from './history-graph-row.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let activeEvents: string[] = [];
  export let canvasWidth: number;
  export let zoomLevel: number = 1;

  $: workflowTaskGroups = groupWorkflowTaskEvents(history);
  $: allGroups = [...workflowTaskGroups, ...groups];

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
      const event = visibleHistory.find((event) => event.id === id);
      if (!event) return 0;
      return getDetailsBoxHeight(event);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = Math.max(
    visibleHistory.length * height + activeDetailsHeight + height,
    400,
  );
  $: visualWidth = canvasWidth / 5;
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight}
  width={canvasWidth}
>
  <Line
    startPoint={[visualWidth, 0]}
    endPoint={[visualWidth, canvasHeight]}
    strokeWidth={4}
  />
  {#each visibleHistory as event, index (event.id)}
    {@const group = allGroups.find((g) => g.eventIds.has(event.id))}
    <HistoryGraphRow
      {event}
      {group}
      groups={allGroups}
      {history}
      {activeEvents}
      {canvasWidth}
      {index}
    />
  {/each}
  <!-- {#each pendingActivities as pendingActivity, index}
    {@const group = groups.find((g) =>
      g.eventIds.has(pendingActivity.activityId),
    )}
    <HistoryGraphRow
      event={pendingActivity}
      {activeEvents}
      {group}
      {groups}
      {history}
      {pendingActivities}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      active={isActive(group)}
      onClick={() => onClick(pendingActivity, group)}
      {index}
    />
  {/each} -->
  <svg
    viewBox="0 0 {2 * canvasWidth} {canvasHeight * zoomLevel}"
    height={canvasHeight}
    width={(2 * canvasWidth) / zoomLevel}
  >
    {#each visibleHistory as event, index (event.id)}
      {@const group = allGroups.find((g) => g.eventIds.has(event.id))}
      <HistoryGraphRowVisual
        {event}
        {group}
        groups={allGroups}
        {history}
        {canvasWidth}
        {activeEvents}
        {zoomLevel}
        {index}
      />
    {/each}
  </svg>
</svg>
