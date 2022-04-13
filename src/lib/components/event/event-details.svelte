<script lang="ts">
  import {
    getSingleAttributeForEvent,
    shouldDisplayAttribute,
  } from '$lib/utilities/get-single-attribute-for-event';
  import EventDetailsRow from './event-details-row.svelte';

  import { formatAttributes } from './_format-attributes';

  export let event: IterableEvent;
  export let summaryEvent = event;
  export let expanded = false;
  export let compact = false;

  $: attributes = formatAttributes(event, { compact });
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
