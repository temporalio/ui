<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { fetchAllEvents, fetchRawEvents } from '$lib/services/events-service';
  import { authUser } from '$lib/stores/auth-user';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const { namespace, workflow: workflowId, run: runId } = $page.params;

  let decodeEventHistory = true;

  $: events = decodeEventHistory
    ? fetchAllEvents({
        namespace: decodeURIForSvelte(namespace),
        workflowId: decodeURIForSvelte(workflowId),
        runId: decodeURIForSvelte(runId),
        settings: $page.data.settings,
        accessToken: $authUser?.accessToken,
        sort: 'ascending',
      })
    : fetchRawEvents({
        namespace: decodeURIForSvelte(namespace),
        workflowId: decodeURIForSvelte(workflowId),
        runId: decodeURIForSvelte(runId),
        sort: 'ascending',
      });
</script>

{#await events}
  <Loading />
{:then events}
  <div class="flex justify-end">
    <label
      for="decode-event-history"
      class="flex items-center gap-4 font-secondary text-sm"
      >View decoded event history<ToggleSwitch
        id="decode-event-history"
        bind:checked={decodeEventHistory}
        data-testid="decode-event-history-toggle"
      />
    </label>
  </div>
  <CodeBlock content={events} data-testid="event-history-json" />
{/await}
