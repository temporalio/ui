<script lang="ts">
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
  export let activeGroups: string[] = [];
  export let canvasWidth: number;
  export let zoomLevel: number = 1;
  export let onClick: (group: EventGroup, event: WorkflowEvent) => void;

  const { height, fontSizeRatio, radius } = HistoryConfig;

  $: isActive = (groupOrEvent: EventGroup | WorkflowEvent): boolean => {
    if (!activeEvents.length && !activeGroups.length) return true;
    if (activeGroups.length) {
      return activeGroups.includes(groupOrEvent?.id);
    } else if (activeEvents.length) {
      return activeEvents.includes(groupOrEvent?.id);
    }
  };

  $: activeDetailsHeight = activeEvents
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      const event = history.find((event) => event.id === id);
      return getDetailsBoxHeight(group ?? event, fontSizeRatio);
    })
    .reduce((acc, height) => acc + height, 0);

  $: canvasHeight = Math.max(
    height * history.length + activeDetailsHeight,
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
    {@const group = groups.find((g) => g.eventIds.has(event.id))}
    <HistoryGraphRow
      {event}
      {group}
      {groups}
      {history}
      {activeEvents}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      {zoomLevel}
      active={isActive(group || event)}
      onClick={() => onClick(group, event)}
      {index}
    />
    {#if activeEvents.includes(event.id)}
      <GroupDetailsRow
        y={getNextDistanceAndOffset(
          history,
          event,
          index,
          groups,
          activeEvents,
          height,
          fontSizeRatio,
        ).y +
          radius / 2}
        {group}
        {event}
        {canvasWidth}
        view="history"
        config={HistoryConfig}
      />
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
