<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import EventDetails from '$lib/components/event/event-details.svelte';
  import EventCategoryMenu from '$lib/components/event/event-category-menu.svelte';

  export let events: HistoryEventWithId[];
</script>

<Pagination items={events} floatId="event-view-toggle" let:visibleItems>
  <section class="full-table">
    <div class="table-header md:table-header-group">
      <div class="md:table-row hidden">
        <div class="table-header-cell w-3/12 rounded-tl-lg">
          Workflow Events<EventCategoryMenu />
        </div>
        <div class="table-header-cell w-3/12">Date & Time</div>
        <div class="table-header-cell w-1/2 rounded-tr-lg">Event Details</div>
      </div>
    </div>
    <div class="table-header md:hidden rounded-t-lg">
      <div class="table-header-cell">Full<EventCategoryMenu /></div>
    </div>
    {#each visibleItems as event (event.id)}
      <article class="row">
        <div class="cell w-full md:w-3/12 mr-3">
          {event.id}
        </div>
        <div class="cell w-full md:w-2/12">{formatDate(event.eventTime)}</div>
        <div class="cell w-full md:w-7/12">
          <EventDetails {event} />
        </div>
      </article>
    {/each}
    {#if !events.length}
      <EmptyState
        title="No Events Match"
        content="There are no events that match your filters. Adjust your filters to see your events."
      />
    {/if}
  </section>
</Pagination>

<style lang="postcss">
  .full-table {
    @apply md:table border-gray-300 border-2 rounded-t-xl w-full mb-6;
  }
  .table-header {
    @apply bg-gray-900 text-gray-100;
  }
  .table-header-cell {
    @apply table-cell text-left p-3;
  }

  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }
</style>
