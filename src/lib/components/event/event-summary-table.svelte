<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import {
    workflowEventsColumnWidth,
    workflowEventsResponsiveColumnWidth,
  } from '$lib/stores/column-width';
  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Button from '$lib/holocene/button.svelte';

  export let compact = false;
  export let typedError = false;
  export let updating = false;

  let title = compact ? 'Event Type' : 'Workflow Events';
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
    <th class="table-cell w-14 md:w-28">
      {#if !compact}<EventDateFilter label="Date & Time" />{:else}Date & Time{/if}
    </th>
    <th class="table-cell w-44"><EventCategoryFilter label={title} /></th>
    <th class="table-cell w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <Button
          thin
          icon={expandAll ? 'chevron-up' : 'chevron-down'}
          on:click={handleChange}
          >{expandAll ? 'Collapse all' : 'Expand All'}</Button
        >
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>

<style lang="postcss">
  .event-table {
    @apply w-full table-fixed rounded-lg border-2 border-gray-900 xl:table;
  }

  .table-header-row {
    @apply bg-gray-900 px-3 text-gray-100;
  }

  .table-header-row-responsive {
    @apply flex justify-between bg-gray-900 px-3 text-gray-100 xl:hidden;
  }

  .table-header {
    @apply flex items-center px-3 py-1 text-left xl:table-cell;
  }

  .table-header-responsive {
    @apply flex items-center p-2;
  }

  .error-table {
    @apply table border border-yellow-700;
  }

  .header-hidden {
    visibility: collapse;
  }

  .header-hidden-responsive {
    @apply hidden;
  }
</style>
