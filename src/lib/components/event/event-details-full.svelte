<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent, WorkflowEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  export let event: IterableEvent;
  export let currentEvent: WorkflowEvent;
  export let compact = false;

  const getAttributes = (event: WorkflowEvent) =>
    formatAttributes(event, $timeFormat, $relativeTime);
</script>

{#if compact && isEventGroup(event)}
  <div class="flex w-full flex-col xl:flex-row">
    {#each event.eventList as groupEvent}
      {@const attributes = getAttributes(groupEvent)}
      {@const details = Object.entries(attributes)}
      <div class="border-r-0 border-subtle px-1 xl:border-r-4">
        <EventDetailsRowExpanded key="id" value={groupEvent.id} {attributes} />
        <EventDetailsRowExpanded
          key="status"
          value={groupEvent.classification}
          {attributes}
        />
        {#each details as [key, value] (key)}
          <EventDetailsRowExpanded {key} {value} {attributes} />
        {/each}
      </div>
    {/each}
  </div>
{:else}
  {@const attributes = getAttributes(currentEvent)}
  {@const details = Object.entries(attributes)}
  <div>
    {#each details as [key, value] (key)}
      <EventDetailsRowExpanded {key} {value} {attributes} />
    {/each}
  </div>
{/if}
