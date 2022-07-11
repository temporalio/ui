<script lang="ts">
  import { ascendingEvents, filteredEvents } from '$lib/stores/events';

  import { formatDate } from '$lib/utilities/format-date';
  import { getEventColorHex } from '$lib/utilities/get-event-style';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import Button from '$lib/holocene/button.svelte';

  const types = [
    'WorkflowTask',
    'ActivityTask',
    'ChildWorkflow',
    'Marker',
    'Signal',
    'Timer',
  ];

  let x: number;

  $: startDate = $ascendingEvents[0]?.eventTime;
  $: endDate = $ascendingEvents[$ascendingEvents.length - 1]?.eventTime;
</script>

<div class="flex flex-col items-center justify-center gap-2 lg:flex-row">
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
<div bind:clientWidth={x}>
  {#each types as type}
    <EventHistoryTimeline {x} {type} />
  {/each}
</div>
<div class="font-base flex justify-between">
  <div>
    <p>Start</p>
    <!-- <small>
      {formatDate(startDate, $timeFormat)}
    </small> -->
  </div>
  <div class="text-right">
    <p>End</p>
    <!-- <small>
      {formatDate(endDate, $timeFormat)}
    </small> -->
  </div>
</div>
<div class="mt-4 flex items-center justify-end gap-4">
  {#if $filteredEvents?.length}
    <small
      >{formatDate($filteredEvents[0].eventTime, $timeFormat)} - {formatDate(
        $filteredEvents[$filteredEvents.length - 1].eventTime,
        $timeFormat,
      )}</small
    >
  {/if}
  <div />
  <Button
    disabled={$filteredEvents === null}
    on:click={() => ($filteredEvents = null)}
    count={$filteredEvents?.length}>Clear</Button
  >
</div>
