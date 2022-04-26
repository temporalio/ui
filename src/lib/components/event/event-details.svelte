<script lang="ts">
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';
  import EventDetailsRow from './event-details-row.svelte';

  import { formatAttributes } from './_format-attributes';

  export let event: IterableEvent;
  export let summaryEvent = event;
  export let expanded = false;
  export let compact = false;

  console.log(`${event.id} EVENT ATTRIBUTES: `, event.attributes);
  $: attributes = formatAttributes(event, { compact });
</script>

<section>
  {#if expanded}
    {#each Object.entries(attributes) as [key, value] (key)}
      <EventDetailsRow {key} {value} />
    {/each}
  {:else}
    <EventDetailsRow {...getSingleAttributeForEvent(summaryEvent)} inline />
  {/if}
</section>
