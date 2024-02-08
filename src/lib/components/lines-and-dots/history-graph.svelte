<script context="module">
  export const historyGap = 24;
</script>

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

  import DetailsDrawer from './details-drawer.svelte';
  import HistoryLineDot from './history-line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];
  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | undefined = undefined;
  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;
  export let clearActive: () => void;

  let maxOffset = 1;
  const isMiddleEvent = (event: WorkflowEvent): boolean => {
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group) return false;
    const ids = Array.from(group.eventIds);
    return ids.indexOf(event.id) === 1;
  };

  const pairIsConsecutive = (x: string, y: string) => {
    return parseInt(x) === parseInt(y) - 1;
  };

  const isConsecutiveGroup = (group: EventGroup): boolean => {
    const ids = Array.from(group.eventIds);
    if (ids.length === 1) return true;
    if (ids.length === 2) return pairIsConsecutive(ids[0], ids[1]);
    if (ids.length === 3) {
      return (
        pairIsConsecutive(ids[0], ids[1]) && pairIsConsecutive(ids[1], ids[2])
      );
    }
  };

  const getOpenGroups = (
    event: WorkflowEvent,
    pendingActivity?: PendingActivity,
  ): number => {
    const group = groups.find((g) => g.eventIds.has(event.id));
    if (!group.pendingActivity && pendingActivity) {
      group.pendingActivity = pendingActivity;
    }
    if (group.level !== undefined) return group.level;

    const openGroups = groups.filter(
      (g) =>
        g.eventList.length > 1 &&
        !g.pendingActivity &&
        !g.eventIds.has(event.id) &&
        g.eventList.some((e) => parseInt(e.id) > parseInt(event.id)) &&
        parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    );

    const pendingGroups = groups.filter(
      (g) =>
        !g.eventIds.has(event.id) &&
        g.pendingActivity &&
        parseInt(g.initialEvent.id) < parseInt(group.initialEvent.id),
    );

    if (
      !openGroups.length &&
      !pendingGroups.length &&
      isConsecutiveGroup(group)
    ) {
      group.level = 0;
    }
    group.level = openGroups.length + pendingGroups.length + 2;
    return group.level;
  };

  const getNextDistanceAndOffset = (
    event: WorkflowEvent,
    index: number,
  ): { nextDistance: number; offset: number; y: number } => {
    let nextDistance = 0;
    let offset = 1;
    let y = (index + 1) * historyGap + historyGap / 2;

    const group = groups.find((g) => g.eventIds.has(event.id));
    const pendingActivity = pendingActivities.find(
      (p) => p.activityId === event.id,
    );

    if (!group) {
      return { nextDistance, offset, y };
    }

    if (group.eventList.length === 1 && !pendingActivity) {
      return { nextDistance, offset, y };
    }

    const currentIndex = group.eventList.indexOf(event);
    const nextEvent = group.eventList[currentIndex + 1];
    offset = getOpenGroups(event, pendingActivity);
    if (offset > maxOffset) maxOffset = offset;
    if (!nextEvent && !pendingActivity) {
      return { nextDistance, offset, y };
    }
    const diff = pendingActivity
      ? history.length -
        parseInt(event.id) +
        pendingActivities.indexOf(pendingActivity) +
        1
      : parseInt(nextEvent.id) - parseInt(event.id);
    nextDistance = diff * historyGap;
    return { nextDistance, offset, y };
  };

  $: isActive = (event?: WorkflowEvent | PendingActivity): boolean => {
    if (activeGroup) {
      return activeGroup?.eventIds.has(event.id);
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };

  let canvasWidth;
  $: canvasHeight =
    historyGap * 2 + historyGap * (history.length + pendingActivities.length);
  $: startingX = canvasWidth / 2;
  $: drawerY = activeEvent
    ? (history.indexOf(activeEvent) + 1) * historyGap + historyGap / 2
    : 0;
</script>

<div class="relative h-auto w-full bg-slate-950" bind:clientWidth={canvasWidth}>
  <svg viewBox="0 0 {canvasWidth} {canvasHeight}">
    <Line x={startingX} y1={0} y2={canvasHeight} />
    {#each history as event, index (event.id)}
      {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
        event,
        index,
      )}
      <HistoryLineDot
        {event}
        {startingX}
        {y}
        {offset}
        {nextDistance}
        category={event.category}
        classification={event.classification}
        connectLine={!isMiddleEvent(event)}
        active={isActive(event)}
        {onClick}
      />
    {/each}
    {#each pendingActivities as pendingActivity, index}
      <HistoryLineDot
        event={pendingActivity}
        {startingX}
        y={(history.length + index + 1) * historyGap + historyGap / 2}
        offset={groups.find((g) => g?.pendingActivity === pendingActivity)
          ?.level || 1}
        nextDistance={0}
        category="pending"
        active={isActive(pendingActivity)}
        {onClick}
      />
    {/each}
  </svg>
  {#if activeEvent}
    <DetailsDrawer
      y={drawerY + 6}
      {activeEvent}
      {activeGroup}
      {clearActive}
      compact={false}
    />
  {/if}
</div>
