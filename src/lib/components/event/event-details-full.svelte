<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent, WorkflowEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';
  import EventGroupDetails from './event-group-details.svelte';

  export let event: IterableEvent;
  export let currentEvent: WorkflowEvent;
  export let compact = false;
  export let selectedId: string;

  $: attributes = formatAttributes(currentEvent, $timeFormat, $relativeTime);
  $: eventDetails = Object.entries(attributes);

  const handleGroupClick = (id: string) => (selectedId = id);
</script>

{#if compact && isEventGroup(event)}
  <div class="flex w-full flex-col lg:flex-row">
    <EventGroupDetails
      eventGroup={event}
      {selectedId}
      onGroupClick={handleGroupClick}
    />
    <div class="block w-full bg-interactive-table-hover lg:w-2/3">
      {#each eventDetails as [key, value] (key)}
        <EventDetailsRowExpanded {key} {value} {attributes} class="w-full" />
      {/each}
    </div>
  </div>
{:else}
  <div class="w-full bg-interactive-table-hover">
    {#each eventDetails as [key, value] (key)}
      <EventDetailsRowExpanded {key} {value} {attributes} class="w-full" />
    {/each}
  </div>
{/if}
