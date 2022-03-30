<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url, params }) {
    const category = url.searchParams.get('category');

    const eventGroups = getEventsInCategory(stuff.eventGroups, category);

    let items: CompactEventGroups = eventGroups;

    return {
      props: {
        items,
      },
      stuff: {
        matchingEventGroups: eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import LoadingRow from '$lib/components/loading-row.svelte';

  import EventCompactTable from '$lib/components/event/event-compact-table.svelte';
  import EventCompactRow from '$lib/components/event/event-compact-row.svelte';

  export let items: IterableEvents;
</script>

{#await items}
  <LoadingRow />
{:then items}
  {#if items.length}
    <Pagination {items} let:visibleItems>
      <EventCompactTable>
        {#each visibleItems as eventGroup (eventGroup.id)}
          <EventCompactRow {eventGroup} />
        {/each}
      </EventCompactTable>
    </Pagination>
  {:else}
    <Pagination {items} let:visibleItems>
      <EventCompactTable>
        <EmptyState title={'No Events Found'} />
      </EventCompactTable>
    </Pagination>
  {/if}
{/await}
