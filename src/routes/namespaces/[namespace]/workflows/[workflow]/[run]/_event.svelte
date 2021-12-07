<script lang="ts">
  import type { HistoryEvent } from '$types';
  import { getAttributesFromEvent } from '$lib/utilities/get-attributes-from-event';

  export let event: HistoryEvent;
  const summaryEvent = getAttributesFromEvent(event);
</script>

<div class="flex flex-row event-box border-2 p-4 rounded-lg justify-between">
  <h2>{event.eventType}</h2>
  <div class="flex flex-row items-center event">
    {#each Object.entries(summaryEvent.attributes) as [event, value]}
      {#if value}
        {#if typeof value === 'object'}
          <p>{event} <span>{JSON.stringify(value)}</span></p>
        {:else}
          <p>{event} <span>{value}</span></p>
        {/if}
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .event-box {
    margin: 1rem 0;
  }

  .event {
    width: 70%;
  }

  span {
    @apply bg-gray-300 p-1;
  }

  p {
    @apply text-sm;
    margin: 0 1rem;
  }
</style>
