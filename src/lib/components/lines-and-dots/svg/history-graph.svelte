<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvents } from '$lib/types/events';

  import { getDetailsBoxHeight, HistoryConfig } from '../constants';

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

  // $: visibleHistory = (history: WorkflowEvents, scrollY: number) => {
  //   return history.filter((event, index) => {
  //     const y = (index + 1) * height + height / 2;
  //     const scrollStartVisible = scrollY + height / 2;
  //     const visible =
  //       y > scrollStartVisible &&
  //       y < scrollStartVisible + CanvasConfig.maxHeight;
  //     return visible;
  //   });
  // };

  $: activeDetailsHeight = activeEvents
    .map((id) => {
      // const group = allGroups.find((group) => group.eventIds.has(id));
      // if (group) {
      //   return getDetailsBoxHeight(group);
      // }
      const event = history.find((event) => event.id === id);
      return getDetailsBoxHeight(event);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = Math.max(
    height * history.length + activeDetailsHeight + height,
    400,
  );
  $: startingX = activeEvents.length ? canvasWidth / 4 : canvasWidth / 2;
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight / zoomLevel}
  width={canvasWidth / zoomLevel}
>
  <Line
    startPoint={[startingX, 0]}
    endPoint={[startingX, canvasHeight]}
    strokeWidth={4}
  />
  {#each history as event, index (event.id)}
    {@const group = allGroups.find((g) => g.eventIds.has(event.id))}
    <HistoryGraphRow
      {event}
      {group}
      groups={allGroups}
      {history}
      {activeEvents}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      {zoomLevel}
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
</svg>
