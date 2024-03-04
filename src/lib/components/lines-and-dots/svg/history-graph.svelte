<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { timeFormat } from '$lib/stores/time-format';
  import type {
    PendingActivity,
    WorkflowEvent,
    WorkflowEvents,
  } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';

  import {
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
  } from '../constants';
  import DrawerWrapper from '../drawer-wrapper.svelte';

  import HistoryGraphRow from './history-graph-row.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;
  export let clearActive: () => void;
  export let zoomLevel: number = 1;

  const { gap } = HistoryConfig;

  $: isActive = (event?: WorkflowEvent | PendingActivity): boolean => {
    if (activeGroup) {
      return activeGroup?.eventIds.has(event.id);
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };

  $: canvasHeight = Math.max(
    gap * 2 + gap * (history.length + pendingActivities.length),
    400,
  );
</script>

<DrawerWrapper {activeGroup} {activeEvent} {clearActive} let:canvasWidth>
  {@const startingX = canvasWidth / 2}
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight / zoomLevel}
    width={canvasWidth}
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
        gap,
      )}
      <HistoryGraphRow
        {event}
        group={groups.find((g) => g.eventIds.has(event.id))}
        canvasWidth={canvasWidth * zoomLevel}
        {startingX}
        {y}
        {offset}
        {nextDistance}
        category={event.category}
        classification={event.classification}
        connectLine={!isMiddleEvent(event, groups)}
        active={isActive(event)}
        {onClick}
        {index}
        showEventType={!activeEvent}
        showTimestamp={!activeEvent &&
          formatDate(event?.eventTime, $timeFormat) !==
            formatDate(history[index - 1]?.eventTime, $timeFormat)}
      />
    {/each}
    {#each pendingActivities as pendingActivity, index}
      <HistoryGraphRow
        event={pendingActivity}
        group={groups.find((g) => g.eventIds.has(pendingActivity.activityId))}
        canvasWidth={canvasWidth * zoomLevel}
        {startingX}
        y={(history.length + index + 1) * gap + gap / 2}
        offset={groups.find((g) => g?.pendingActivity === pendingActivity)
          ?.level || 1}
        nextDistance={0}
        category="pending"
        active={isActive(pendingActivity)}
        {onClick}
        {index}
      />
    {/each}
  </svg>
</DrawerWrapper>
