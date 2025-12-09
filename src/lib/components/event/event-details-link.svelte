<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import { type EventLinkType } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForNexusEndpoint,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  export let value: string;
  export let attributes: CombinedAttributes;
  export let type: EventLinkType;

  $: ({ workflow, namespace } = $page.params);

  function getHref(ns, wf, attrs, val, linkType) {
    if (linkType === 'execution') {
      return routeForEventHistory({ namespace: ns, workflow: wf, run: val });
    } else if (linkType === 'task-queue') {
      routeForTaskQueue({ namespace: ns, queue: val });
    } else if (linkType === 'child-workflow') {
      routeForEventHistory({
        namespace: ns,
        workflow: attributes.workflowExecutionWorkflowId,
        run: attributes.workflowExecutionRunId,
      });
    } else if (linkType === 'nexus-endpoint') {
      routeForNexusEndpoint(val);
    }
  }

  $: href = getHref(namespace, workflow, attributes, value, type);
</script>

<Link class={$$restProps.class} {href}>
  {value}
</Link>
