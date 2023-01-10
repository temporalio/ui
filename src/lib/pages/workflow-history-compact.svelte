<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { page } from '$app/stores';
  import { fetchAllEvents } from '$lib/services/events-service';

  let events: CommonHistoryEvent[] = [];

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings, user } = $page.data;
    events = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      accessToken: user?.accessToken,
      sort: 'ascending',
    });
  };

  $: fetchEvents(
    $page.params.namespace,
    $page.params.workflow,
    $page.params.run,
  );
</script>

<EventSummary {events} compact={true} />
