<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import { routeForWorkflow } from '$lib/utilities/route-for';

  import Link from '$lib/components/link.svelte';
  import EventClassification from './event-classification.svelte';
  import EventDetails from './event-details.svelte';
  import EventSingleDetail from './event-single-detail.svelte';

  export let event: HistoryEventWithId;

  $: collapsed = true;

  const onRowClick = () => (collapsed = !collapsed);
</script>

<article class="row" on:click={onRowClick}>
  <div class="cell">
    <div>
      {event.id}<EventClassification {event} />
    </div>
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
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .row {
    @apply last-of-type:border-b-0;
  }
</style>
