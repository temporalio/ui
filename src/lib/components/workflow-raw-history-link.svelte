<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let namespace: string;
  export let workflowId: string;
  export let runId: string;

  $: href = routeForEventHistory({
    namespace,
    workflow: workflowId,
    run: runId,
  });

  $: jsonHref = href + '.json';
</script>

{#if !$isCloud}
  <div class="flex items-center space-x-4">
    <Link
      icon="external-link"
      class="whitespace-nowrap"
      href={jsonHref}
      newTab={true}
      data-testid="view-raw-event-history"
    >
      {translate('events.view-raw-history')}
    </Link>
  </div>
{/if}
