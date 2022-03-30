<script lang="ts">
  import { page } from '$app/stores';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import LoadingRow from '$lib/components/loading-row.svelte';

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventSummaryTable from './event-summary-table.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import EventCompactTable from './event-compact-table.svelte';
  import EventCompactRow from './event-compact-row.svelte';

  export let items: IterableEvents;
  export let category: EventTypeCategory;

  $: view = $page.params.view;

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
      {#if view === 'compact'}
        <EventCompactTable>
          {#each visibleItems as eventGroup (eventGroup.id)}
            <EventCompactRow {eventGroup} />
          {/each}
        </EventCompactTable>
      {:else}
        <EventSummaryTable>
          {#each visibleItems as event (event.id)}
            <EventSummaryRow {event} />
          {/each}
        </EventSummaryTable>
      {/if}
    </Pagination>
  {:else}
    <EmptyState title={'No Events Found'} />
  {/if}
{/await}
