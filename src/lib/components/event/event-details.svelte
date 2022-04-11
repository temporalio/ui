<script lang="ts">
  import {
    getSingleAttributeForEvent,
    shouldDisplayAttribute,
  } from '$lib/utilities/get-single-attribute-for-event';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: IterableEvent;
  export let expanded = false;
</script>

<section>
  {#if expanded}
    {#each Object.entries(event.attributes) as [key, value] (key)}
      {#if shouldDisplayAttribute(key, value)}
        <EventDetailsRow {key} {value} />
      {/if}
    {/each}
  {:else}
    <EventDetailsRow {...getSingleAttributeForEvent(event)} />
  {/if}
</section>
