<script lang="ts">
  import EventClassification from './event-classification.svelte';
  import EventSingleDetail from './event-single-detail.svelte';
  import EventGroupDetails from './event-group-details.svelte';
  import EventDetails from './event-details.svelte';

  export let eventGroup: CompactEventGroups;

  $: collapsed = true;

  const onRowClick = () => (collapsed = !collapsed);
</script>

<article class="row" on:click={onRowClick}>
  <div class="cell">
    <div>
      <span class="link"><EventClassification event={eventGroup} /></span>
      {#if !collapsed}
        <div class="p-8">
          <EventGroupDetails event={eventGroup.initialEvent} {eventGroup} />
        </div>
      {/if}
    </div>
  </div>
  <div class="cell">
    {#if collapsed}
      <EventSingleDetail {eventGroup} />
    {:else}
      <EventDetails event={eventGroup.initialEvent} />
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
    @apply bg-gray-50 cursor-pointer;
  }

  .row {
    @apply last-of-type:border-b-0;
  }

  .link {
    @apply text-gray-900 mx-4;
  }

  .row:hover :global(.link) {
    @apply text-blue-700 border-b-2 border-blue-700;
  }
</style>
