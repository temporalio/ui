<script lang="ts">
  import { scrollTop } from '$lib/holocene/main-content-container.svelte';
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
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

  let startIndex = 0;
  let endIndex = 200;
  $: diff = endIndex - startIndex;

  const setHistorySlice = (top: number) => {
    const scrollIndex = Math.round(top / height);
    // Scrolling up
    if (endIndex - scrollIndex < 50) {
      endIndex += 200;
    }

    if (diff > 400) {
      startIndex += 200;
    }

    // Scrolling down
    if (startIndex >= 200 && scrollIndex - startIndex < 50) {
      startIndex -= 200;
      endIndex -= 200;
    }
  };

  $: setHistorySlice($scrollTop);

  $: visibleHistory = history.slice(startIndex, endIndex);

  $: activeDetailsHeight = activeEvents
    .map((id) => {
      const event = visibleHistory.find((event) => event.id === id);
      return getDetailsBoxHeight(event);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = Math.max(
    height * visibleHistory.length + activeDetailsHeight + height,
    400,
  );

  $: width = canvasWidth / 4;
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight}
  width={canvasWidth}
>
  <Line
    startPoint={[width, 0]}
    endPoint={[width, canvasHeight]}
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
    viewBox="0 0 {canvasWidth / zoomLevel} {canvasHeight * zoomLevel}"
    height={canvasHeight}
    width={canvasWidth}
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
