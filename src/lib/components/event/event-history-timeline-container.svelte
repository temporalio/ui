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

  export let events: WorkflowEvents;
  export let eventGroups: EventGroups;
  export let isRunning: boolean;

  let showEventTypeFilter = false;
  let eventTypeValue = '';
  let eventTypeFilters: string[] = [];
  let eventGroupFilters: string[] = timelineEventTypeOptions.map(
    (o) => o.option,
  );

  const handleGroupClick = (option: string) => {
    if (eventGroupFilters.includes(option)) {
      eventGroupFilters = eventGroupFilters.filter((o) => o !== option);
    } else {
      eventGroupFilters = [option, ...eventGroupFilters];
    }
  };

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
    eventGroupFilters = timelineEventTypeOptions.map((o) => o.option);
  };

  $: groupsWithGroupFilter = eventGroups.filter((group) => {
    return eventGroupFilters.includes(group.category);
  });

  $: groups = !eventTypeFilters.length
    ? groupsWithGroupFilter
    : groupsWithGroupFilter.filter((group) => {
        return group.eventList.find((event) =>
          eventTypeFilters.includes(event.eventType),
        );
      });
</script>

<div class="mt-2 flex flex-col items-center justify-between gap-2 xl:flex-row">
  <div class="flex flex-col gap-2 md:flex-row lg:gap-4">
    <Button
      secondary
      on:click={() => (showEventTypeFilter = !showEventTypeFilter)}
      ><Icon name="sliders" /></Button
    >
    {#each timelineEventTypeOptions as type}
      <div
        class="flex cursor-pointer items-center text-sm xl:text-base"
        on:click={() => handleGroupClick(type.option)}
      >
        <div
          class="mx-2 flex h-6 w-6 items-center rounded-full"
          style="background: {type.color}"
        >
          {#if eventGroupFilters.includes(type.option)}
            <Icon name="checkMark" scale={0.8} stroke="#fff" />
          {/if}
        </div>
        {type.label}
      </div>
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
<div class="my-4 flex items-center gap-2">
  {#if showEventTypeFilter}
    <div class="w-full lg:w-1/2 xl:w-1/4">
      <Autocomplete
        id="eventType"
        label="Event Type"
        icon="search"
        bind:value={eventTypeValue}
        on:input={(e) => (eventTypeValue = e.target.value)}
        options={Object.keys(eventTypeCategorizations)}
        onOptionClick={handleOptionClick}
      />
    </div>
    {#each eventTypeFilters as filter}
      <Badge
        ><div class="flex items-center gap-1">
          {filter}
          <button
            class="cursor-pointer"
            on:click={() => handleClearOption(filter)}
            ><Icon name="close" /></button
          >
        </div></Badge
      >
    {/each}
  {/if}
</div>
<EventHistoryGroupTimeline {events} eventGroups={groups} {isRunning} />
