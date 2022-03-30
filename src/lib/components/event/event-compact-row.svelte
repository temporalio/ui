<script lang="ts">
  import EventClassification from './event-classification.svelte';
  import EventSingleDetail from './event-single-detail.svelte';
  import EventGroupDetails from './event-group-details.svelte';

  export let eventGroup: CompactEventGroups;

  $: collapsed = true;

  const onRowClick = () => (collapsed = !collapsed);
</script>

<article class="row" on:click={onRowClick}>
  <div class="cell">
    <div>
      {eventGroup.id}<EventClassification event={eventGroup} />
    </div>
  </div>
  <div class="cell">
    {#if collapsed}
      <EventSingleDetail {eventGroup} />
    {:else}
      <EventGroupDetails event={eventGroup.initialEvent} {eventGroup} />
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
