<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink } from '$lib/types/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let link: EventLink;
  export let value = link.workflowEvent.workflowId;
  export let label = translate('nexus.link');
  export let href = routeForEventHistory({
    namespace: link.workflowEvent.namespace,
    workflow: link.workflowEvent.workflowId,
    run: link.workflowEvent.runId,
  });
  export let xs = false;
</script>

<div
  class="flex flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-sm" class:text-xs={xs}>
    {label}
  </p>
  <div class="overflow-hidden" class:truncate={!!xs}>
    <Link {href}>
      {value}
    </Link>
  </div>
</div>
