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
        category,
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

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';

  export let items: HistoryEventWithId[];
  export let category: EventTypeCategory;

  const startingIndex = items.findIndex(
    ({ id }) => $page.params.eventId === id,
  );
</script>

{#await items}
  <LoadingRow />
{:then items}
  {#if items.length}
    <div class="flex items-center gap-4">
      <FilterSelect parameter="category" bind:value={category}>
        <Option value={undefined}>All</Option>
        <Option value="activity">Activity</Option>
        <Option value="command">Command</Option>
        <Option value="signal">Signal</Option>
        <Option value="timer">Timer</Option>
        <Option value="child-workflow">Child Workflow</Option>
        <Option value="workflow">Workflow</Option>
      </FilterSelect>
    </div>
    <Pagination {items} {startingIndex} let:visibleItems>
      <EventSummaryTable>
        {#each visibleItems as event (event.id)}
          <EventSummaryRow {event} />
        {/each}
      </EventSummaryTable>
    </Pagination>
  {:else}
    <EmptyState title={'No Events Found'} />
  {/if}
{/await}
