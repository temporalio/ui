<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url, params }) {
    const category = url.searchParams.get('category');

    const events = getEventsInCategory(stuff.events, category);

    let items: HistoryEventWithId[] = events;

    return {
      props: {
        items,
      },
      stuff: {
        matchingEvents: events,
      },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import LoadingRow from '$lib/components/loading-row.svelte';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';

  export let items: HistoryEventWithId[];

  const startingIndex = items.findIndex(
    ({ id }) => $page.params.eventId === id,
  );
</script>

{#await items}
  <LoadingRow />
{:then items}
  {#if items.length}
    <Pagination {items} {startingIndex} let:visibleItems>
      <EventSummaryTable>
        {#each visibleItems as event (event.id)}
          <EventSummaryRow {event} />
        {/each}
      </EventSummaryTable>
    </Pagination>
  {:else}
    <Pagination {items} {startingIndex} let:visibleItems>
      <EventSummaryTable>
        <EmptyState title={'No Events Found'} />
      </EventSummaryTable>
  </Pagination>
  {/if}
{/await}
