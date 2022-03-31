<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import EventClassification from './event-classification.svelte';
  import EventDetails from './event-details.svelte';
  import EventSingleDetail from './event-single-detail.svelte';

  export let event: HistoryEventWithId;

  $: collapsed = true;

  const onRowClick = () => (collapsed = !collapsed);
</script>

<article class="row" on:click={onRowClick} id={event.id}>
  <div class="cell">
    <span class="text-gray-500 text-normal">{event.id}</span><span class="link"
      ><EventClassification {event} /></span
    >
  </div>
  <div class="cell links font-medium md:font-normal">
    {formatDate(event?.eventTime)}
  </div>
  <div class="cell links">
    {#if collapsed}
      <EventSingleDetail {event} />
    {:else}
      <EventDetails {event} />
    {/if}
  </div>
</article>

<style lang="postcss">
  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50 cursor-pointer;
  }

  .link {
    @apply text-gray-900 mx-4;
  }

  .row:hover :global(.link) {
    @apply text-blue-700 border-b-2 border-blue-700;
  }
</style>
