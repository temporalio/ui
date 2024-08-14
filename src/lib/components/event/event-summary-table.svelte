<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { expandAllEvents } from '$lib/stores/event-view';

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
  class="dense w-full table-fixed"
  data-testid="event-summary-table"
>
  <caption class="sr-only" slot="caption"
    >{translate('workflows.event-history')}</caption
  >
  <TableHeaderRow slot="headers">
    <td class="w-14 xl:w-10" />
    <th class="w-16 md:w-32">Event Time</th>
    <th class="w-44">Event Type</th>
    <th class="w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <Button
          size="xs"
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
