<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { fetchAllEvents, fetchRawEvents } from '$lib/services/events-service';
  import { authUser } from '$lib/stores/auth-user';
  import { decodeJSON } from '$lib/stores/data-encoder-config';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const { namespace, workflow: workflowId, run: runId } = $page.params;
  const { settings } = $page.data;

  $: getEvents = $decodeJSON
    ? fetchAllEvents({
        namespace: decodeURIForSvelte(namespace),
        workflowId: decodeURIForSvelte(workflowId),
        runId: decodeURIForSvelte(runId),
        settings,
        accessToken: $authUser?.accessToken,
        sort: 'ascending',
      })
    : fetchRawEvents({
        namespace: decodeURIForSvelte(namespace),
        workflowId: decodeURIForSvelte(workflowId),
        runId: decodeURIForSvelte(runId),
        sort: 'ascending',
      });

  const onChange = () => {
    $decodeJSON = !$decodeJSON;
  };
</script>

{#await getEvents}
  <Loading />
{:then events}
  <div class="flex items-center justify-end mb-4">
    <label for="decode" class="flex items-center gap-4 font-secondary text-sm"
      >Decode JSON
      <ToggleSwitch id="decode" checked={$decodeJSON} on:change={onChange} />
    </label>
  </div>
  <CodeBlock content={events} data-testid="event-history-json" />
{/await}
