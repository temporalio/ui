<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { page } from '$app/stores';

  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import Button from '$lib/holocene/button.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { expandAllEvents } from '$lib/stores/event-view';

  import EventCategoryMultiselectFilter from './event-category-multiselect-filter.svelte';

  export let compact = false;
  export let updating = false;

  let expandAll = $expandAllEvents === 'true';

  $: id = $page.params.id;

  const dispatch = createEventDispatcher();

  function handleChange() {
    expandAll = !expandAll;
    dispatch('expandAll', {
      expanded: expandAll ? 'true' : 'false',
    });
  }
</script>

<Table
  {updating}
  class="dark w-full table-fixed"
  data-testid="event-summary-table"
>
  <caption class="sr-only" slot="caption"
    >{translate('workflows.event-history')}</caption
  >
  <TableHeaderRow slot="headers">
    <td class="w-14 xl:w-10" />
    <th class="w-16 md:w-32">
      <EventDateFilter {compact} />
    </th>
    <th class="w-44"><EventCategoryMultiselectFilter {compact} /></th>
    <th class="w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <Button
          size="sm"
          variant="table-header"
          trailingIcon={expandAll ? 'chevron-up' : 'chevron-down'}
          disabled={!!id}
          on:click={handleChange}
        >
          <span class="hidden sm:block">
            {expandAll
              ? translate('common.collapse-all')
              : translate('common.expand-all')}
          </span>
        </Button>
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>
