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

  import {
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
  } from '../constants';

  import HistoryGraphRow from './history-graph-row.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let activeGroup: EventGroup | undefined = undefined;
  export let canvasWidth: number;
  export let zoomLevel: number = 1;
  export let onClick: (groupOrEvent: EventGroup | WorkflowEvent) => void;

  const { height } = HistoryConfig;

  $: isActive = (groupOrEvent: EventGroup | WorkflowEvent): boolean => {
    if (!activeEvent && !activeGroup) return true;
    if (activeGroup) {
      return activeGroup.id === groupOrEvent?.id;
    } else if (activeEvent) {
      return activeEvent.id === groupOrEvent?.id;
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
    {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
      history,
      event,
      index,
      groups,
      pendingActivities,
      height,
    )}
    {@const group = groups.find((g) => g.eventIds.has(event.id))}
    <HistoryGraphRow
      {event}
      {group}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      {y}
      {offset}
      {nextDistance}
      {zoomLevel}
      category={event.category}
      classification={event.classification}
      connectLine={!isMiddleEvent(event, groups)}
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
      group={groups.find((g) => g.eventIds.has(pendingActivity.activityId))}
      canvasWidth={canvasWidth * zoomLevel}
      {startingX}
      y={(history.length + index + 1) * height + height / 2}
      offset={groups.find((g) => g?.pendingActivity === pendingActivity)
        ?.level || 1}
      nextDistance={0}
      category="pending"
      active={isActive(activeGroup)}
      onClick={() => onClick(group)}
      {index}
    />
  {/each}
</svg>
