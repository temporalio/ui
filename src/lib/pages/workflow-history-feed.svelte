<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import { refresh } from '$lib/stores/workflow-run';

  let events: CommonHistoryEvent[] = [];

  $: namespace = $page.params.namespace;
  $: workflowId = $page.params.workflow;
  $: runId = $page.params.run;

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    sort: EventSortOrder,
  ) => {
    const { settings, user } = $page.data;
    events = [];
    events = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: user?.accessToken,
      sort,
    });
  };

  $: $refresh, fetchEvents(namespace, workflowId, runId, $eventFilterSort);

  onDestroy(() => {
    $timelineEvents = null;
  });
</script>

<EventSummary {events} />
