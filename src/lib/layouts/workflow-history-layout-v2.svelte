<script lang="ts">
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';
  import {
    eventFilterSort,
    type EventSortOrder,
    eventViewType,
  } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { refresh } from '$lib/stores/workflow-run';
  import type { EventView } from '$lib/types/events';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    view: EventView,
    sort: EventSortOrder,
  ) => {
    resetFullHistory();
    $fullEventHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: view === 'feed' ? sort : 'ascending',
    });
  };

  $: $refresh,
    fetchEvents(namespace, workflowId, runId, $eventViewType, $eventFilterSort);
</script>

<div class="flex flex-col gap-2">
  <div class="flex gap-2 bg-gray-900 text-white">
    <div class="w-48">Dots and lines</div>
    <div class="w-1/2 grow flex-col gap-2">
      {#each $fullEventHistory as event}
        <div>{event.name}</div>
      {/each}
    </div>
    <div class="grow bg-gray-400">Details go here</div>
  </div>
  <EventSummary />
  <!-- <EventHistoryTimeline history={$fullEventHistory} /> -->
</div>
