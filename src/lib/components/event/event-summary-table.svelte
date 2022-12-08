<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let compact = false;
  export let updating = false;

  let expandAll = $expandAllEvents === 'true';

  const dispatch = createEventDispatcher();

  function handleChange(e: Event) {
    expandAll = !expandAll;
    dispatch('expandAll', {
      expanded: expandAll ? 'true' : 'false',
    });
  }
</script>

<Table {updating} class="dark w-full table-fixed">
  <TableHeaderRow slot="headers">
    <th class="table-cell w-14 xl:w-10" />
    <th class="table-cell w-16 md:w-32">
      {#if !compact}<EventDateFilter />{:else}
        <span class="hidden md:block">Date & Time</span>
        <span class="block md:hidden"><Icon name="clock" /></span>{/if}
    </th>
    <th class="table-cell w-44"><EventCategoryFilter {compact} /></th>
    <th class="table-cell w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <button
          class="relative flex w-28 items-center justify-between rounded"
          on:click={handleChange}
        >
          <div>{expandAll ? 'Collapse all' : 'Expand All'}</div>
          <div class="">
            <Icon name={expandAll ? 'chevron-up' : 'chevron-down'} />
          </div>
        </button>
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>

<style lang="postcss">
  .error-table {
    @apply table border border-yellow-700;
  }
</style>
