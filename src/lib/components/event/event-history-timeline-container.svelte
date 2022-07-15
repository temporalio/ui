<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';

  import {
    formatDate,
    getTimestampDifference,
  } from '$lib/utilities/format-date';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import {
    getEventsInCategory,
    timelineEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import EventHistoryGroupTimeline from './event-history-group-timeline.svelte';

  export let events: WorkflowEvents;
  export let eventGroups: EventGroups;
  export let isRunning: boolean;
</script>

<div class="my-4 flex flex-col items-center justify-between gap-2 xl:flex-row">
  <div class="flex flex-col gap-2 md:flex-row lg:gap-4">
    {#each timelineEventTypeOptions as type}
      <h3 class="flex items-center text-sm xl:text-base">
        <div
          class="mx-2 h-4 w-4 rounded-full"
          style="background: {type.color}"
        />
        {type.label}
      </h3>
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
<EventHistoryGroupTimeline {events} {eventGroups} {isRunning} />

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
