<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { fetchRawEvents } from '$lib/services/events-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let decodeEventHistory = true;
  let events = [];

  const fetchEvents = async () => {
    events = await fetchRawEvents({
      namespace: decodeURIForSvelte(namespace),
      workflowId: decodeURIForSvelte(workflowId),
      runId: decodeURIForSvelte(runId),
      sort: 'ascending',
    });
  };
  $: decodeEventHistory, fetchEvents();
</script>

<WorkflowJsonNavigator {events} {decodeEventHistory}>
  <ToggleSwitch
    slot="decode"
    label="View decoded event history"
    id="decode-event-history"
    bind:checked={decodeEventHistory}
    data-testid="decode-event-history-toggle"
  />
</WorkflowJsonNavigator>
