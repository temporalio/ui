<script context="module">
  export const historyGap = 24;
</script>

<script lang="ts">
  import debounce from 'just-debounce';

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
    if (!group) {
      return { nextDistance, offset, y };
    }

    const pendingActivity = group.pendingActivity;
    if (group.eventList.length === 1 && !pendingActivity) {
      return { nextDistance, offset, y };
    }

    const currentIndex = group.eventList.indexOf(event);
    const nextEvent = group.eventList[currentIndex + 1];
    offset = getOpenGroups(event, pendingActivity);
    if (!nextEvent && !pendingActivity) {
      return { nextDistance, offset, y };
    }

    // TODO: Dont extend line when activity completes and there was a pending activity
    // if (!nextEvent && pendingActivity && group.eventList.length === 3) {
    //   return { nextDistance, offset, y };
    // }

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

  let scrollTop = 0;
  let canvasWidth = 1000;
  $: canvasHeight = Math.max(
    historyGap * 2 + historyGap * (history.length + pendingActivities.length),
    400,
  );
  $: startingX = canvasWidth / 2;

  const handleScroll = async (e) => {
    scrollTop = e.target.scrollTop;
  };

  // $: filterHistory = () => {
  //   return history.filter((event, index) => {
  //     const { y } = getNextDistanceAndOffset(event, index);
  //     return y >= scrollTop - 100 && y <= scrollTop + 900;
  //   });
  // };
</script>

<div
  class="relative flex h-auto max-h-[800px] w-full gap-0 overflow-auto"
  on:scroll={debounce(handleScroll, 50)}
>
  <div
    class="relative h-full {activeEvent
      ? 'w-1/2'
      : 'w-full'} overflow-auto bg-slate-950"
    bind:clientWidth={canvasWidth}
  >
    <svg viewBox="0 0 {canvasWidth} {canvasHeight}">
      <Line x1={startingX} x2={startingX} y1={0} y2={canvasHeight} />
      {#each history as event, index (event.id)}
        {@const { nextDistance, offset, y } = getNextDistanceAndOffset(
          event,
          index,
        )}
        <HistoryLineDot
          {event}
          group={groups.find((g) => g.eventIds.has(event.id))}
          {scrollTop}
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
          group={groups.find((g) => g.eventIds.has(pendingActivity.activityId))}
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
  </div>
  {#if activeEvent}
    <div class="sticky top-0 w-1/2">
      <DetailsDrawer
        {activeEvent}
        {activeGroup}
        {clearActive}
        compact={false}
      />
    </div>
  {/if}
</div>
