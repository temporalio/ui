<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type {
    PendingActivity,
    WorkflowEvent,
    WorkflowEvents,
  } from '$lib/types/events';

  import { HistoryConfig } from '../constants';

  import HistoryGraphRow from './history-graph-row.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeEvents: string[] = [];
  export let activeGroups: string[] = [];
  export let canvasWidth: number;
  export let zoomLevel: number = 1;
  export let onClick: (groupOrEvent: EventGroup | WorkflowEvent) => void;

  const { height } = HistoryConfig;

  $: isActive = (groupOrEvent: EventGroup | WorkflowEvent): boolean => {
    if (!activeEvents.length && !activeGroups.length) return true;
    if (activeGroups.length) {
      return activeGroups.includes(groupOrEvent?.id);
    } else if (activeEvents.length) {
      return activeEvents.includes(groupOrEvent?.id);
    }
  };

  $: canvasHeight = Math.max(
    height * 2 + height * (history.length + pendingActivities.length),
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
      {pendingActivities}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      {zoomLevel}
      active={isActive(group || event)}
      onClick={() => onClick(group || event)}
      {index}
    />
  {/each}
  {#each pendingActivities as pendingActivity, index}
    {@const group = groups.find((g) =>
      g.eventIds.has(pendingActivity.activityId),
    )}
    <HistoryGraphRow
      event={pendingActivity}
      {group}
      {groups}
      {history}
      {pendingActivities}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      active={isActive(group)}
      onClick={() => onClick(group)}
      {index}
    />
  {/each}
</svg>
