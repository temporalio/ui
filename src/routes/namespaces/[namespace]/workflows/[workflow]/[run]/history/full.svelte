<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
    const { events } = stuff;

    return {
      props: {
        events,
      },
    };
  };
</script>

<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import EventDetails from './_event-details.svelte';

  export let events: HistoryEventWithId[];
</script>

<section class="border-2 border-gray-300 rounded-lg w-full mb-6">
  <header class="flex table-header rounded-t-lg">
    <h3 class="w-1/12">Workflow Events</h3>
    <h3 class="w-2/12">Date & Time</h3>
    <h3 class="w-3/4">Event Details</h3>
  </header>
  {#each events as event}
    <article class="table-row" id={event.id}>
      <p class="w-1/12"><a href="#{event.id}">{event.id}</a></p>
      <p class="w-2/12">{formatDate(event.eventTime)}</p>
      <div class="w-3/4">
        <EventDetails {event} />
      </div>
    </article>
  {/each}
</section>

<style lang="postcss">
  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 flex justify-between items-center border-b-2;
  }

  .table-row {
    @apply flex border-b-2 border-gray-300 last-of-type:border-b-0 p-4;
  }
</style>
