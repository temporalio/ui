<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';

  import {
    getDetailsBoxHeight,
    getNextDistanceAndOffset,
    HistoryConfig,
  } from '../constants';

  import GroupDetailsRow from './group-details-row.svelte';
  import HistoryGraphRow from './history-graph-row.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let activeEvents: string[] = [];
  export let canvasWidth: number;
  export let zoomLevel: number = 1;

  $: workflowTaskGroups = groupWorkflowTaskEvents(history);
  $: allGroups = [...workflowTaskGroups, ...groups];

  const { height, radius } = HistoryConfig;

  $: isActive = (groupOrEvent: EventGroup | WorkflowEvent): boolean => {
    if (activeEvents.length) {
      return activeEvents.includes(groupOrEvent?.id);
    }
    return true;
  };

  $: activeDetailsHeight = activeEvents
    .map((id) => {
      const group = allGroups.find((group) => group.eventIds.has(id));
      if (group) {
        return getDetailsBoxHeight(group);
      }
      const event = history.find((event) => event.id === id);
      return getDetailsBoxHeight(event);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = Math.max(
    height * history.length + activeDetailsHeight + height,
    400,
  );

  $: startingX = canvasWidth / 2;
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
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      {zoomLevel}
      active={isActive(group || event)}
      {index}
    />
    {#if activeEvents.includes(event.id)}
      {@const { y } = getNextDistanceAndOffset(
        history,
        event,
        index,
        allGroups,
        activeEvents,
        height,
      )}
      <GroupDetailsRow y={y + radius} {group} {event} {canvasWidth} />
    {/if}
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
