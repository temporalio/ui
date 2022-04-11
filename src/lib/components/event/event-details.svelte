<script lang="ts">
  import { shouldDisplayAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: HistoryEventWithId;
</script>

<section>
  {#each Object.entries(event.attributes) as [key, value] (key)}
    {#if shouldDisplayAttribute(key, value)}
      <EventDetailsRow {key} {value} />
    {/if}
  {/each}
</section>
