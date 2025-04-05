<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink } from '$lib/types/events';
  import {
    routeForEventHistory,
    routeForEventHistoryEvent,
  } from '$lib/utilities/route-for';

  export let link: EventLink;
  export let value = link.workflowEvent.workflowId;
  export let label = translate('nexus.link');
  export let href: string | undefined = undefined;

  $: if (!href) {
    if (link.workflowEvent?.eventRef?.eventId) {
      href = routeForEventHistoryEvent({
        namespace: link.workflowEvent.namespace,
        workflow: link.workflowEvent.workflowId,
        run: link.workflowEvent.runId,
        eventId: link.workflowEvent.eventRef.eventId,
      });
      value = `${link.workflowEvent.workflowId}/history/events/${link.workflowEvent.eventRef.eventId}`;
    } else if (
      link.workflowEvent?.eventRef?.eventType ===
      'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED'
    ) {
      href = routeForEventHistoryEvent({
        namespace: link.workflowEvent.namespace,
        workflow: link.workflowEvent.workflowId,
        run: link.workflowEvent.runId,
        eventId: '1',
      });
      value = `${link.workflowEvent.workflowId}/history/events/1`;
    } else {
      href = routeForEventHistory({
        namespace: link.workflowEvent.namespace,
        workflow: link.workflowEvent.workflowId,
        run: link.workflowEvent.runId,
      });
      value = `${link.workflowEvent.workflowId}/history`;
    }
  }
</script>

<div
  class="flex flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-sm">
    {label}
  </p>
  <div class="overflow-hidden {$$props.linkClass}">
    <Link {href}>
      {value}
    </Link>
  </div>
</div>
