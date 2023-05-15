<script lang="ts">
  import { page } from '$app/stores';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import { fetchAllEvents, fetchRawEvents } from '$lib/services/events-service';
  import { authUser } from '$lib/stores/auth-user';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let decodeEventHistory = true;
  let events = [];

  const fetchEvents = async () => {
    events = decodeEventHistory
      ? await fetchAllEvents({
          namespace: decodeURIForSvelte(namespace),
          workflowId: decodeURIForSvelte(workflowId),
          runId: decodeURIForSvelte(runId),
          settings: $page.data.settings,
          accessToken: $authUser?.accessToken,
          sort: 'ascending',
        })
      : await fetchRawEvents({
          namespace: decodeURIForSvelte(namespace),
          workflowId: decodeURIForSvelte(workflowId),
          runId: decodeURIForSvelte(runId),
          sort: 'ascending',
        });
  };
  $: decodeEventHistory, fetchEvents();
</script>

<WorkflowJsonNavigator {events}>
  <label
    slot="decode"
    for="decode-event-history"
    class="flex items-center gap-4 font-secondary text-sm w-96 min-w-fit sm:justify-end"
    ><ToggleSwitch
      id="decode-event-history"
      bind:checked={decodeEventHistory}
      data-testid="decode-event-history-toggle"
    />View decoded event history
  </label>
</WorkflowJsonNavigator>
