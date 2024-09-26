<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { EventLink } from '$lib/types/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let link: EventLink;
  $: href = routeForEventHistory({
    namespace: link.workflowEvent.namespace,
    workflow: link.workflowEvent.workflowId,
    run: link.workflowEvent.runId,
    eventId: link.workflowEvent.eventRef?.eventId,
  });
</script>

<div
  class="flex max-w-lg flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 xl:max-w-xl {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-xs">Link</p>
  <div class="overflow-hidden truncate pr-1">
    <Badge type="subtle">
      <Link {href}>
        {link.workflowEvent.workflowId}
      </Link>
    </Badge>
  </div>
</div>
