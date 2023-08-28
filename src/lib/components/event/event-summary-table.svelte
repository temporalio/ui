<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import Button from '$lib/holocene/button.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { expandAllEvents } from '$lib/stores/event-view';

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
  <caption class="sr-only" slot="caption"
    >{translate('workflows', 'recent-events')}</caption
  >
  <TableHeaderRow slot="headers">
    <td class="w-14 xl:w-10" />
    <th class="w-16 md:w-32">
      <EventDateFilter {compact} />
    </th>
    <th class="w-44"><EventCategoryFilter {compact} /></th>
    <th class="w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <Button
          size="sm"
          trailingIcon={expandAll ? 'chevron-up' : 'chevron-down'}
          on:click={handleChange}
        >
          <span class="hidden sm:block">
            {expandAll ? translate('collapse-all') : translate('expand-all')}
          </span>
        </Button>
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>
