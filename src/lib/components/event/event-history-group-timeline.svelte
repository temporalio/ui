<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import { noop } from 'svelte/internal';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { timelineEvents } from '$lib/stores/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { getTimestampDifference } from '$lib/utilities/format-time';
  import { timelineEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import { timeFormat } from '$lib/stores/time-format';
  import EmptyState from '$lib/holocene/empty-state.svelte';

  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let events: WorkflowEvents;
  export let eventGroups: EventGroups;
  export let isRunning: boolean;

  let width: number;
  let canvas: HTMLDivElement;
  let blockHeight = 30;
  let xBuffer = 200;
  let yBuffer = 10;
  let activeGroup: number;
  let mouseX = xBuffer;

  function handleMouseMove(event: MouseEvent) {
    const offset = canvas.getBoundingClientRect();
    const { x } = offset;
    const { clientX } = event;
    if (clientX && clientX - x > xBuffer) {
      mouseX = clientX - x;
    }
  }

  $: startDate = events[0]?.eventTime;
  $: endDate = isRunning
    ? new Date(Date.now())
    : events[events.length - 1]?.eventTime;
  $: totalDistance = getTimestampDifference(
    startDate as string,
    endDate as string,
  );
  $: currentDate = new Date(
    Date.parse(startDate as string) +
      (mouseX - xBuffer) * (totalDistance / (width - xBuffer)),
  );

  $: getDistance = (date): number => {
    if (!date) {
      return 0;
    }

    const diff = getTimestampDifference(startDate as string, date);
    return diff * ((width - xBuffer) / totalDistance);
  };

  $: getGroupProperties = (group: EventGroup) => {
    const index = eventGroups.indexOf(group);
    const startDistance = getDistance(group.initialEvent.eventTime);
    const endDistance = getDistance(group.lastEvent.eventTime);
    const duration = endDistance - startDistance;
    const typeOption = timelineEventTypeOptions.find(
      (o) => o.option == group.category,
    );
    const top = index * blockHeight + yBuffer / 2;

    const failure = eventOrGroupIsFailureOrTimedOut(group);
    const canceled = eventOrGroupIsCanceled(group);
    const terminated = eventOrGroupIsTerminated(group);

    return {
      top,
      left: startDistance + xBuffer,
      right: duration < 5 ? startDistance + 5 : endDistance,
      width: Math.max(duration, 5),
      height: blockHeight / 2,
      color: typeOption?.color ?? '#e4e4e7',
      failure,
      canceled,
      terminated,
    };
  };

  const handleGroupClick = (group: EventGroup) => {
    activeGroup = group.id;
    $timelineEvents = group.eventList;
  };
</script>

{#if eventGroups.length}
  <div
    class="relative h-full overflow-auto rounded-lg border border-gray-900 bg-gray-900 text-white"
    bind:clientWidth={width}
    on:mousemove={handleMouseMove}
  >
    <div
      bind:this={canvas}
      class="relative"
      style="height: {blockHeight * eventGroups.length +
        yBuffer}px; width: {width}px;"
    >
      <h3 class="flex gap-2 p-4"><Icon name="graph" />Activities</h3>
      <VirtualList
        items={eventGroups}
        let:item
        itemHeight={blockHeight}
        class="timeline-list"
      >
        {@const {
          top,
          left,
          width,
          height,
          color,
          failure,
          canceled,
          terminated,
        } = getGroupProperties(item)}
        <div
          class="event-group"
          style="top:
                {top +
            blockHeight /
              4}px; left: {left}px; width: {width}px; height: {height -
            1}px; background: {color};"
        />
        <button
          class="absolute truncate border-r border-gray-900 px-4 text-left text-sm font-medium hover:bg-gray-700"
          class:event-group-active={$timelineEvents?.length &&
            activeGroup === item.id}
          class:failure
          class:canceled
          class:terminated
          style="top: {top}px; left: 0; width: {xBuffer}px; height: {blockHeight}px; font-size: 10px;"
          on:mousemove|stopPropagation={noop}
          on:click={() => handleGroupClick(item)}
        >
          {#if failure}
            <Icon class="inline text-red-700" name="clock" />
          {/if}
          {#if canceled}
            <Icon class="inline text-yellow-700" name="clock" />
          {/if}
          {#if terminated}
            <Icon class="inline text-pink-700" name="clock" />
          {/if}
          {item.name}
        </button>
      </VirtualList>
      <!-- <div
        class="absolute top-0 bg-blueGray-400"
        style="height:
              {blockHeight * eventGroups.length +
          yBuffer}px;left: {mouseX}px; width: 1px;"
      /> -->
    </div>
    <!-- <div class="flex justify-start md:text-md font-base text-sm">
      <pre class="text-right">Start: {formatDate(startDate, $timeFormat)}</pre>
    </div> -->
  </div>
{/if}

<style lang="postcss">
  .event-group {
    @apply absolute rounded-sm text-center drop-shadow-md;
  }

  .event-group-active {
    @apply bg-gray-700;
  }

  .failure {
    @apply bg-red-100 text-red-700 hover:bg-red-200;
  }

  .event-group-active.failure {
    @apply bg-red-200;
  }

  .canceled {
    @apply bg-yellow-100 text-yellow-700 hover:bg-yellow-200;
  }

  .event-group-active.canceled {
    @apply bg-yellow-200;
  }

  .terminated {
    @apply bg-pink-100 text-pink-700 hover:bg-pink-200;
  }

  .event-group-active.terminated {
    @apply bg-pink-200;
  }
</style>
