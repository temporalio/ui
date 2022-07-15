<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import {
    formatDate,
    getTimestampDifference,
  } from '$lib/utilities/format-date';
  import { timelineEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { timeFormat } from '$lib/stores/time-format';

  export let events: WorkflowEvents;
  export let eventGroups: EventGroups;
  export let isRunning: boolean;

  let width;
  let canvas;
  let m = { x: 0, y: 0 };
  let blockHeight = 20;
  let buffer = 50;

  function handleMouseMove(event) {
    const offset = canvas.getBoundingClientRect();
    if (event.target.id === 'timeline-canvas') {
      if (event.clientX) {
        m.x = event.clientX - offset.x;
      }
    }
  }

  $: startDate = events[0]?.eventTime;
  $: currentDate = new Date(
    Date.parse(startDate) + m.x * (totalDistance / width),
  );
  $: endDate = events[events.length - 1]?.eventTime;

  $: totalDistance = getTimestampDifference(
    startDate as string,
    endDate as string,
  );

  $: getDistance = (date): number => {
    if (!date) {
      return 0;
    }

    const diff = getTimestampDifference(startDate, date);
    return diff * (width / totalDistance);
  };

  $: getGroupProperties = (group: EventGroup) => {
    const index = eventGroups.indexOf(group);
    const startDistance = getDistance(group.initialEvent.eventTime);
    const endDistance = getDistance(group.lastEvent.eventTime);
    const duration = endDistance - startDistance;
    const typeOption = timelineEventTypeOptions.find(
      (o) => o.option == group.category,
    );
    const top = index * blockHeight + buffer / 2;
    return `top: ${top}px; left: ${startDistance}px; width: ${
      duration || blockHeight
    }px; height: ${blockHeight - 4}px; background: ${
      typeOption?.color ?? '#e4e4e7'
    }; margin: 2px 0;`;
  };

  const handleGroupClick = (group) => {
    $timelineEvents = group.eventList;
  };
</script>

<div
  class="max-h-80 w-full cursor-crosshair overflow-auto rounded-lg bg-blueGray-900"
  bind:clientWidth={width}
  on:mousemove|stopPropagation={handleMouseMove}
>
  <div
    id="timeline-canvas"
    bind:this={canvas}
    style="height: {blockHeight * eventGroups.length + buffer}px;"
  >
    {#each eventGroups as group}
      {@const style = getGroupProperties(group)}
      <div class="event-group" {style} on:click={() => handleGroupClick(group)}>
        <Tooltip top text={group.name}
          ><div class="rounded-full" {style} /></Tooltip
        >
      </div>
    {/each}
  </div>
  <div
    class="absolute top-0 bg-blueGray-500"
    style="height: {blockHeight * eventGroups.length +
      buffer}px;left: {m.x}px; width: 1px"
  />
</div>
<div class="font-base">
  <div class="flex justify-end">
    <pre class="text-right">Start: {formatDate(startDate, $timeFormat)}</pre>
  </div>
  <div class="flex justify-end">
    <pre>Current: {formatDate(currentDate, $timeFormat)}</pre>
  </div>
  <div class="flex justify-end">
    <pre class="text-right">{isRunning ? 'Last' : 'End'}: {formatDate(
        endDate,
        $timeFormat,
      )}</pre>
  </div>
</div>

<style lang="postcss">
  .event-group {
    @apply absolute cursor-pointer rounded-full text-center transition duration-300 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg;
  }
</style>
