<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { timeline } from '$lib/stores/timeline';

  import EventCategoryFilter from './event-category-filter.svelte';
  import EventDateFilter from './event-date-filter.svelte';

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
    >{translate('workflows', 'event-history')}</caption
  >
  <TableHeaderRow slot="headers" class="bg-purple-300">
    <td class="w-14 xl:w-10"></td>
    <th class="w-16 md:w-32"></th>
    <th class="w-44"></th>
    <th class="w-auto xl:w-80">
      <div class="flex w-full justify-end">
        <div class="flex items-center justify-end gap-2 py-1">
          <div class="flex flex-col gap-2 md:flex-row">
            <div class="flex gap-2">
              <EventDateFilter {compact} />
              <EventCategoryFilter {compact} />
              <Button
                variant="secondary"
                trailingIcon={expandAll ? 'chevron-up' : 'chevron-down'}
                on:click={handleChange}
              >
                <span class="hidden sm:block">
                  {expandAll
                    ? translate('collapse-all')
                    : translate('expand-all')}
                </span>
              </Button>
              <Button variant="secondary" on:click={() => $timeline.zoomIn(1)}
                >+</Button
              >
              <Button variant="secondary" on:click={() => $timeline.zoomOut(1)}
                >-</Button
              >
              <Button
                variant="secondary"
                on:click={() => $timeline.focus('workflow')}>Fit</Button
              >
            </div>
          </div>
        </div>
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>
