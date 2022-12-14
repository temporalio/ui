<script lang="ts">
  import { page } from '$app/stores';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { refresh } from '$lib/stores/workflow-run';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import KeyboardShortcut from '$lib/holocene/keyboard-shortcut/shortcut.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { authUser } from '$lib/stores/auth-user';

  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  $: category = $page.url.searchParams.get('category');
  $: total = category ? '' : $eventHistory.end[0]?.id;

  $: fetchEvents = () => {
    return getPaginatedEvents({
      namespace: $page.params.namespace,
      workflowId: $page.params.workflow,
      runId: $page.params.run,
      sort: $eventFilterSort,
      category,
      compact,
      settings: $page.stuff.settings,
      accessToken: $authUser?.accessToken,
    });
  };

  const onShiftUp = (event: KeyboardEvent) => {
    if (!compact) {
      const sort = 'ascending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: 'ascending',
        url: $page.url,
      });
    }
  };

  const onShiftDown = (event: KeyboardEvent) => {
    if (!compact) {
      const sort = 'descending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: sort,
        url: $page.url,
      });
    }
  };
</script>

{#key [$eventFilterSort, category, $refresh]}
  <ApiPagination
    let:visibleItems
    let:updating
    let:activeRow
    let:setActiveRow
    onFetch={fetchEvents}
    onError={(error) => console.error(error)}
    pageSizeOptions={[]}
    {onShiftUp}
    {onShiftDown}
    {total}
  >
    <svelte:fragment slot="action-top-left">
      <KeyboardShortcut arrow="left" tooltipText="Previous Page" />
      <KeyboardShortcut arrow="up" tooltipText="Previous Row" />
      <KeyboardShortcut arrow="down" tooltipText="Next Row" />
      <KeyboardShortcut arrow="right" tooltipText="Next Page" />
      <KeyboardShortcut tooltipText="Open / Close Row">Space</KeyboardShortcut>
      {#if !compact}
        <Tooltip text="Ascending order" top>
          <div class="flex gap-1 text-gray-500 dark:text-gray-400">
            <KeyboardShortcut>Shift</KeyboardShortcut>
            +
            <KeyboardShortcut arrow="up" />
          </div>
        </Tooltip>
        <Tooltip text="Descending order" top>
          <div class="flex gap-1 text-gray-500 dark:text-gray-400">
            <KeyboardShortcut>Shift</KeyboardShortcut>
            +
            <KeyboardShortcut arrow="down" />
          </div>
        </Tooltip>
      {/if}
    </svelte:fragment>
    <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
      {@const events = compact ? groupEvents(visibleItems) : visibleItems}
      {#each events as event, index (`${event.id}-${event.timestamp}`)}
        <EventSummaryRow
          {event}
          {compact}
          {visibleItems}
          expandAll={$expandAllEvents === 'true'}
          initialItem={$eventHistory?.start?.[0]}
          active={activeRow === index}
          onRowClick={() => setActiveRow(index)}
        />
      {:else}
        <EventEmptyRow />
      {/each}
    </EventSummaryTable>
  </ApiPagination>
{/key}
