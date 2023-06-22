<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  export let compact = false;
  export let updating = false;

  let expandAll = $expandAllEvents === 'true';

  const dispatch = createEventDispatcher();

  function handleChange() {
    expandAll = !expandAll;
    dispatch('expandAll', {
      expanded: expandAll ? 'true' : 'false',
    });
  }
</script>

<Table {updating} class="dark w-full table-fixed">
  <TableHeaderRow slot="headers">
    <th class="w-14 xl:w-10" />
    <th class="w-16 md:w-32">
      <EventDateFilter {compact} />
    </th>
    <th class="w-44"><EventCategoryFilter {compact} /></th>
    <th class="w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <button
          class="relative flex w-28 items-center justify-end rounded sm:justify-between"
          on:click={handleChange}
        >
          <span class="hidden sm:block">
            {expandAll ? translate('collapse-all') : translate('expand-all')}
          </span>
          <Icon name={expandAll ? 'chevron-up' : 'chevron-down'} />
        </button>
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>
