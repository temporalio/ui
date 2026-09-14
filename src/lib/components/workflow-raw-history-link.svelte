<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical } from '$lib/io/icon';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { parameters } from '$lib/stores/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  const { namespace, workflowId, runId } = $parameters;

  const href = $derived(
    routeForEventHistory({
      namespace,
      workflow: workflowId,
      run: runId,
    }),
  );

  const jsonHref = $derived(href + '.json');
</script>

{#if !$isCloud}
  <div class="flex items-center space-x-4">
    <Link
      LeadingIcon={IconExternalLinkOptical}
      class="whitespace-nowrap"
      href={jsonHref}
      newTab={true}
      data-testid="view-raw-event-history"
    >
      {translate('events.view-raw-history')}
    </Link>
  </div>
{/if}
