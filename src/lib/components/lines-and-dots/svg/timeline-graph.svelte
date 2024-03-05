<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';
  import DrawerWrapper from '../drawer-wrapper.svelte';
  import TimelineAxisLabels from '../timeline-axis-labels.svelte';

  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';

  export let workflow: WorkflowExecution;
  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let onClick: (event: EventGroup) => void;
  export let clearActive: () => void;
  export let zoomLevel: number = 1;

  const { gap, gutterStart, gutterEnd, radius } = TimelineConfig;

  $: startTime = $fullEventHistory[0]?.eventTime || workflow.startTime;
  $: endTime = workflow.isRunning ? Date.now() : workflow.endTime;
  $: fullDistance = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });

  $: getDistance = (event: WorkflowEvent, canvasWidth: number) => {
    const distance = getMillisecondDuration({
      start: startTime,
      end: event.eventTime,
      onlyUnderSecond: false,
    });

    return Math.round(
      (distance / fullDistance) * (canvasWidth - (gutterStart + gutterEnd)),
    );
  };

  $: getNextEventDistance = (
    event: WorkflowEvent,
    group: EventGroup,
    canvasWidth: number,
    finishingX: number,
  ): { x: number; nextX: number } => {
    const x = getDistance(event, canvasWidth);
    let nextX = 0;

    if (group.eventList.length > 1) {
      const ids = Array.from(group.eventIds);
      const groupIndex = ids.indexOf(event.id);
      if (groupIndex < ids.length - 1) {
        nextX = getDistance(group.eventList[groupIndex + 1], canvasWidth) - x;
      }
    } else if (group.pendingActivity) {
      nextX = finishingX - x - gutterStart;
    }

    return { x, nextX };
  };

  $: isActive = (event?: WorkflowEvent | PendingActivity): boolean => {
    if (activeGroup) {
      return (
        activeGroup?.eventIds.has(event.id) ||
        activeGroup?.pendingActivity?.id === event.id
      );
    } else if (event && activeEvent?.id) {
      return activeEvent.id === event?.id;
    } else return true;
  };

  $: canvasHeight = Math.max(gap * 2 + gap * groups.length, 200);
</script>

<DrawerWrapper {activeGroup} {activeEvent} {clearActive} let:canvasWidth>
  {@const finishingX = canvasWidth - gutterEnd}
  <svg
    class="w-full"
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight / zoomLevel}
    width={canvasWidth}
  >
    <Line
      startPoint={[gutterStart, 0]}
      endPoint={[gutterStart, canvasHeight]}
      strokeWidth={radius / 2}
      status={'none'}
    />
    <Line
      startPoint={[finishingX, 0]}
      endPoint={[finishingX, canvasHeight]}
      strokeWidth={radius / 2}
      status={workflow.status}
    />
    {#each groups as group, index (group.id)}
      {#each group.eventList as event (event.id)}
        {@const { x, nextX } = getNextEventDistance(
          event,
          group,
          canvasWidth,
          finishingX,
        )}
        <TimelineGraphRow
          {group}
          {event}
          y={(index + 1) * gap + gap / 2}
          x={gutterStart + x}
          {canvasWidth}
          {nextX}
          category={event.category}
          active={isActive(event)}
          onClick={() => onClick(group)}
          showText={(group.eventList.length === 1 && !group.pendingActivity) ||
            (group.eventList.length > 1 && group.lastEvent.id === event.id)}
        />
      {/each}
      {#if group.pendingActivity}
        <TimelineGraphRow
          {group}
          event={group.pendingActivity}
          y={(index + 1) * gap + gap / 2}
          x={finishingX}
          {canvasWidth}
          category="pending"
          active={isActive(group.pendingActivity)}
          onClick={() => onClick(group)}
          showText
        />
      {/if}
    {/each}
    <TimelineAxis x1={gutterStart} x2={finishingX - 2} y={canvasHeight - 2} />
  </svg>
  <TimelineAxisLabels {startTime} />
</DrawerWrapper>
