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
  import DrawerWrapper from '../drawer-wrapper.svelte';

  import HistoryLineDot from './history-line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;
  export let clearActive: () => void;

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
  <svg viewBox="0 0 {canvasWidth} {canvasHeight}">
    <Line x1={startingX} x2={startingX} y1={0} y2={canvasHeight} />
    {#each history as event, index (event.id)}
      {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
        history,
        event,
        index,
        groups,
        pendingActivities,
        gap,
      )}
      <HistoryLineDot
        {event}
        group={groups.find((g) => g.eventIds.has(event.id))}
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
      />
    {/each}
    {#each pendingActivities as pendingActivity, index}
      <HistoryLineDot
        event={pendingActivity}
        group={groups.find((g) => g.eventIds.has(pendingActivity.activityId))}
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
