<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';

  let events: CommonHistoryEvent[] = [];

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    sort: EventSortOrder,
  ) => {
    const { settings, user } = $page.data;
    events = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: user?.accessToken,
      sort,
    });
  };

  $: fetchEvents(
    $page.params.namespace,
    $page.params.workflow,
    $page.params.run,
    $eventFilterSort,
  );

  onDestroy(() => {
    $timelineEvents = null;
  });
</script>

<EventSummary {events} />
