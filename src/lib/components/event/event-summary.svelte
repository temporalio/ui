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
  import { authUser } from '$lib/stores/auth-user';
  import EventShortcutKeys from './event-shortcut-keys.svelte';

  export let compact = false;
  let showShortcuts = false;

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

  const onSpace = (event: KeyboardEvent) => {
    event.preventDefault();
    showShortcuts = !showShortcuts;
  };
</script>

<EventShortcutKeys open={showShortcuts} {compact} />
{#key [$eventFilterSort, category, $refresh]}
  <ApiPagination
    let:visibleItems
    let:updating
    let:activeIndex
    let:setActiveIndex
    onFetch={fetchEvents}
    onError={(error) => console.error(error)}
    pageSizeOptions={[]}
    {onShiftUp}
    {onShiftDown}
    {onSpace}
    {total}
  >
    <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
      {@const events = compact ? groupEvents(visibleItems) : visibleItems}
      {#each events as event, index (`${event.id}-${event.timestamp}`)}
        <EventSummaryRow
          {event}
          {compact}
          {visibleItems}
          expandAll={$expandAllEvents === 'true'}
          initialItem={$eventHistory?.start?.[0]}
          active={activeIndex === index}
          onRowClick={() => setActiveIndex(index)}
        />
      {:else}
        <EventEmptyRow />
      {/each}
    </EventSummaryTable>
  </ApiPagination>
{/key}
