<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';

  import {
    formatDate,
    getTimestampDifference,
  } from '$lib/utilities/format-date';
  import { getEventColorHex } from '$lib/utilities/get-event-style';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';

  export let events: WorkflowEvents;
  export let isRunning: boolean;
  let x: number;

  const types = [
    'ActivityTask',
    'ChildWorkflow',
    'Marker',
    'Signal',
    'Timer',
    'WorkflowTask',
  ];

  $: startDate = events[0]?.eventTime;
  $: endDate = events[events.length - 1]?.eventTime;
  $: totalDistance = getTimestampDifference(
    startDate as string,
    endDate as string,
  );

  const allSteps = [
    { id: '1m', value: 72000000 },
    { id: '1w', value: 16800000 },
    { id: '1d', value: 2400000 },
    { id: '1h', value: 100000 },
    { id: '1m', value: 60000 },
    { id: '10s', value: 10000 },
    { id: '1s', value: 1000 },
    { id: '100ms', value: 100 },
    { id: '20ms', value: 20 },
    { id: '10ms', value: 10 },
  ];

  $: steps = [];
  $: activeStep = 1000;

  $: {
    steps = allSteps.filter(
      (step) =>
        Math.ceil(totalDistance / step.value) <= 200 &&
        Math.floor(totalDistance / step.value) >= 1,
    );
    activeStep = steps[steps.length - 1]?.value ?? 1000;
  }
  $: blockCount = Math.ceil(totalDistance / activeStep);

  const onStepClick = (stepValue: number) => {
    activeStep = stepValue;
    blockCount = Math.ceil(totalDistance / stepValue);
  };
</script>

<div class="my-4 flex flex-col xl:flex-row items-center justify-between gap-2">
  <div class="flex flex-col md:flex-row gap-2 lg:gap-4">
    {#each types as type}
      <h3 class="flex items-center text-sm xl:text-base">
        <div
          class="mx-2 h-4 w-4 rounded-full"
          style="background: {getEventColorHex(type)}"
        />
        {type}
      </h3>
    {/each}
  </div>
  <div
    class="flex flex-col md:flex-row grow gap-2 items-center justify-between"
  >
    <div class="grow inline-flex gap-2 justify-center" role="group">
      {#each steps as { id, value }}
        <Button
          active={value === activeStep}
          secondary
          on:click={() => onStepClick(value)}>{id}</Button
        >
      {/each}
    </div>

    <div class="flex gap-2">
      <Button
        secondary
        disabled={$timelineEvents === null}
        on:click={() => ($timelineEvents = null)}>Clear</Button
      >
      <Button
        secondary
        disabled={!isRunning}
        on:click={() => window.location.reload()}
        ><Icon name="refresh" stroke="currentcolor" scale={0.8} /></Button
      >
    </div>
  </div>
</div>
<div bind:clientWidth={x}>
  {#each types as type}
    {@const typeEvents = events.filter((e) => e.eventType.includes(type))}
    <EventHistoryTimeline
      {typeEvents}
      {x}
      {type}
      {startDate}
      {totalDistance}
      {blockCount}
    />
  {/each}
</div>
<div class="font-base">
  <div class="flex justify-end">
    <pre class="text-right">Start {formatDate(startDate, $timeFormat)}</pre>
  </div>
  <div class="flex justify-end">
    <pre class="text-right">{isRunning ? 'Last' : 'End'} {formatDate(
        endDate,
        $timeFormat,
      )}</pre>
  </div>
</div>

<!-- <div class="font-base flex justify-between">
  <div>
    <p>Start</p>
    <p class="flex gap-1 text-sm items-center">
      {formatDate(startDate, $timeFormat)}
    </p>
  </div>
  <div class="text-right">
    <p>{isRunning ? 'Last' : 'End'}</p>
    <p class="flex gap-1 text-sm items-center">
      {formatDate(endDate, $timeFormat)}
    </p>
  </div>
</div> -->
