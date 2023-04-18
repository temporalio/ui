<script lang="ts">
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  import {
    formatAttributes,
    attributeGroups,
  } from '$lib/utilities/format-event-attributes';
  import EventDetailPills from './event-detail-pills.svelte';
  import EventGroupDetails from './event-group-details.svelte';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { IterableEvent, WorkflowEvent } from '$lib/types/events';

  export let event: IterableEvent;
  export let currentEvent: WorkflowEvent;
  export let compact = false;
  export let selectedId: string;

  $: attributes = formatAttributes(currentEvent, { compact });
  $: attributeGrouping = attributeGroups(event, attributes);
  $: activePill = Object.keys(attributeGrouping).find(
    (key) => attributeGrouping[key].length,
  );
  $: eventDetails = Object.entries(attributes);

  const handlePillChange = (event: CustomEvent) => {
    activePill = event.detail.key;
  };

  const handleGroupClick = (id: string) => (selectedId = id);
</script>

{#if compact && isEventGroup(event)}
  <div class="flex w-full flex-col lg:flex-row">
    <EventGroupDetails
      eventGroup={event}
      {selectedId}
      onGroupClick={handleGroupClick}
    />
    <div class="block w-full lg:w-2/3">
      <EventDetailPills
        {attributeGrouping}
        {activePill}
        on:pillChange={handlePillChange}
      />
      {#each eventDetails as [key, value] (key)}
        {#if attributeGrouping[activePill]?.includes(key)}
          <EventDetailsRowExpanded {key} {value} {attributes} class="w-full" />
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <div class="w-full">
    <EventDetailPills
      {attributeGrouping}
      {activePill}
      on:pillChange={handlePillChange}
    />
    {#each eventDetails as [key, value] (key)}
      {#if attributeGrouping[activePill]?.includes(key)}
        <EventDetailsRowExpanded {key} {value} {attributes} class="w-full" />
      {/if}
    {/each}
  </div>
{/if}
