<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { page } from '$app/stores';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { refresh } from '$lib/stores/workflow-run';
  import type { StartAndEndEventHistory } from '$lib/stores/events';

  export let eventHistory: StartAndEndEventHistory;
  let events: CommonHistoryEvent[] = [];

  $: namespace = $page.params.namespace;
  $: workflowId = $page.params.workflow;
  $: runId = $page.params.run;

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings, user } = $page.data;
    events = [];
    events = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: user?.accessToken,
      sort: 'ascending',
    });
  };

  $: $refresh, fetchEvents(namespace, workflowId, runId);
</script>

<EventSummary {events} {eventHistory} compact={true} />
