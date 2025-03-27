<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { getEndpointForRawHistory } from '$lib/services/events-service';
  import { parameters } from '$lib/stores/events';

  const { namespace, workflowId, runId } = $parameters;

  $: link = getEndpointForRawHistory({
    namespace,
    workflowId,
    runId,
  });
</script>

<div class="flex items-center space-x-4">
  <Link
    class="whitespace-nowrap"
    href={link}
    newTab={true}
    data-testid="view-raw-event-history"
  >
    <!-- TODO: i18n needed -->
    Raw History
  </Link>
</div>
