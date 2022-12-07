<script lang="ts">
  import { page } from '$app/stores';
  import VirtualList from '@sveltejs/svelte-virtual-list';

  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import { getPaginatedEvents } from '$lib/services/events-service';
  import { eventHistory } from '$lib/stores/events';
  import { groupEvents } from '$lib/models/event-groups';
  import { refresh } from '$lib/stores/workflow-run';

  export let compact = false;

  let items = [];
  let nextPageToken: NextPageToken = '';

  let start;
  let end;

  const nextFetchBuffer = 150;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  // $: {
  //   if (nextPageToken && end > 0 && end === items.length - nextFetchBuffer) {
  //     getPaginatedEvents({
  //       namespace,
  //       workflowId,
  //       runId,
  //       pageToken: nextPageToken,
  //       sort: $eventFilterSort,
  //       compact,
  //     }).then((data) => {
  //       items = [...items, ...data.items];
  //       nextPageToken = data.nextPageToken;
  //     });
  //   }
  // }

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let fetchEvents = getPaginatedEvents({
    namespace,
    workflowId,
    runId,
    pageToken: nextPageToken,
    sort: $eventFilterSort,
    compact,
  }).then((data) => {
    items = data.items;
    nextPageToken = data.nextPageToken;
  });

  const onPageReset = () => {
    $refresh = Date.now();
  };
</script>

{#await fetchEvents then}
  <EventSummaryTable {compact} on:expandAll={handleExpandChange} />
  <div class="h-[800px]">
    <VirtualList
      items={compact ? groupEvents(items) : items}
      let:item
      bind:start
      bind:end
      class="timeline-list"
    >
      <EventSummaryRow
        event={item}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        initialItem={null}
        visibleItems={items}
        active={false}
      />
    </VirtualList>
  </div>
{/await}
