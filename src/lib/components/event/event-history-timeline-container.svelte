<script lang="ts">
  import { ascendingEvents, timelineEvents } from '$lib/stores/events';

  import {
    formatDate,
    getTimestampDifference,
  } from '$lib/utilities/format-date';
  import { getEventColorHex } from '$lib/utilities/get-event-style';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';

  import Slider from '$lib/holocene/slider.svelte';
  import { noop } from 'svelte/internal';

  const types = [
    'WorkflowTask',
    'ActivityTask',
    'ChildWorkflow',
    'Marker',
    'Signal',
    'Timer',
  ];

  export let isRunning: boolean;
  let x: number;

  $: startDate = $ascendingEvents[0]?.eventTime;
  $: endDate = $ascendingEvents[$ascendingEvents.length - 1]?.eventTime;
  $: totalDistance = getTimestampDifference(startDate, endDate);
  $: unitOfTime = totalDistance / value / 1000;

  let value = 50;
  let theme = 'default';
</script>

<div class="my-4 flex items-center justify-between gap-2">
  <div class="flex gap-8">
    {#each types as type}
      <h3 class="flex items-center text-base">
        <div
          class="mx-2 h-4 w-4 rounded-full"
          style="background: {getEventColorHex(type)}"
        />
        {type}
      </h3>
    {/each}
  </div>
  <div class="flex grow items-center justify-between">
    <div class="grow px-8" class:purple-theme={theme === 'purple'}>
      <Slider
        min={1}
        initialValue={value}
        thumbValue="{unitOfTime.toFixed(3)}s"
        step={10}
        on:change={(e) => (value = e.detail.value)}
      />
    </div>
    <div class="flex gap-2">
      <Button
        secondary
        disabled={$timelineEvents === null}
        on:click={() => ($timelineEvents = null)}>Clear</Button
      >
      <Button secondary on:click={() => noop}
        ><Icon name="refresh" scale={0.8} /></Button
      >
    </div>
  </div>
</div>
<div bind:clientWidth={x}>
  {#each types as type}
    <EventHistoryTimeline
      {x}
      {type}
      {startDate}
      {totalDistance}
      blockCount={value}
    />
  {/each}
</div>
<div class="font-base flex justify-between">
  <div>
    <small><strong>Start</strong> [{formatDate(startDate, $timeFormat)}]</small>
  </div>
  <div class="text-right">
    <small
      ><strong>{isRunning ? 'Last' : 'End'}</strong> [{formatDate(
        endDate,
        $timeFormat,
      )}]</small
    >
  </div>
</div>
<div class="mt-4 flex items-center justify-end gap-4" />
