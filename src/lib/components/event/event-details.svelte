<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import {
    getSingleAttributeForEvent,
    shouldDisplayAttribute,
  } from '$lib/utilities/get-single-attribute-for-event';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: IterableEvent;
  export let summaryEvent = event;
  export let expanded = false;
  export let compact = false;

  $: attributes = compact
    ? { eventTime: formatDate(event.eventTime), ...event.attributes }
    : event.attributes;
</script>

<section>
  {#if expanded}
    {#each Object.entries(attributes) as [key, value] (key)}
      {#if shouldDisplayAttribute(key, value)}
        <EventDetailsRow {key} {value} />
      {/if}
    {/each}
  {:else}
    <EventDetailsRow {...getSingleAttributeForEvent(summaryEvent)} />
  {/if}
</section>
