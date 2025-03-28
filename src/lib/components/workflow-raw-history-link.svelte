<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { parameters } from '$lib/stores/events';
  import { routeForWorkflowHistoryJson } from '$lib/utilities/route-for';

  const { namespace, workflowId, runId } = $parameters;

  $: href = routeForWorkflowHistoryJson({
    namespace,
    workflow: workflowId,
    run: runId,
  });
</script>

{#if !$isCloud}
  <div class="flex items-center space-x-4">
    <Link
      icon="external-link"
      class="whitespace-nowrap"
      {href}
      newTab={true}
      data-testid="view-raw-event-history"
    >
      {translate('events.view-raw-history')}
    </Link>
  </div>
{/if}
