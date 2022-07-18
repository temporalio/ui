<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/index.svelte';
  import {
    eventTypeCategorizations,
    timelineEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import EventHistoryGroupTimeline from './event-history-group-timeline.svelte';
  import Autocomplete from '$lib/holocene/autocomplete.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Slider from '$lib/holocene/slider.svelte';

  export let events: WorkflowEvents;
  export let eventGroups: EventGroups;
  export let isRunning: boolean;

  let zoom = 1;
  let eventTypeValue = '';
  let eventTypeFilters: string[] = [];

  const handleOptionClick = (option: string) => {
    eventTypeValue = '';
    if (!eventTypeFilters.includes(option)) {
      eventTypeFilters = [option, ...eventTypeFilters];
    }
  };

  const handleClearOption = (option: string) => {
    eventTypeFilters = eventTypeFilters.filter((o) => o !== option);
  };

  const handleClear = () => {
    $timelineEvents = null;
    eventTypeValue = '';
    eventTypeFilters = [];
  };

  $: groups = !eventTypeFilters.length
    ? eventGroups
    : eventGroups.filter((group) => {
        return group.eventList.find((event) =>
          eventTypeFilters.includes(event.eventType),
        );
      });
</script>

<div class="mt-2 flex flex-col items-center justify-between gap-2 xl:flex-row">
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
      disabled={$timelineEvents === null && !eventTypeFilters.length}
      on:click={handleClear}>Clear</Button
    >
    <Button
      secondary
      disabled={!isRunning}
      on:click={() => window.location.reload()}
      ><Icon name="refresh" stroke="currentcolor" scale={0.8} /></Button
    >
  </div>
</div>
<div class="flex mb-2 items-center gap-2">
  <Autocomplete
    id="eventType"
    label="Event Type"
    icon="search"
    bind:value={eventTypeValue}
    on:input={(e) => (eventTypeValue = e.target.value)}
    options={Object.keys(eventTypeCategorizations)}
    onOptionClick={handleOptionClick}
  />
  {#each eventTypeFilters as filter}
    <Badge
      ><div class="flex gap-1 items-center">
        {filter}
        <button
          class="cursor-pointer"
          on:click={() => handleClearOption(filter)}
          ><Icon name="close" /></button
        >
      </div></Badge
    >
  {/each}
</div>
<EventHistoryGroupTimeline {events} eventGroups={groups} {isRunning} {zoom} />

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
