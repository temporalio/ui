<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import { type EventLinkType } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForNexusEndpoint,
    routeForTaskQueue,
    routeForTimeline,
  } from '$lib/utilities/route-for';

  export let value: string;
  export let attributes: CombinedAttributes;
  export let type: EventLinkType;

  $: ({ workflow, namespace } = $page.params);

  function getHref(
    ns: string,
    wf: string,
    attrs: CombinedAttributes,
    val: string,
    linkType: EventLinkType,
  ): string {
    if (linkType === 'execution') {
      return routeForTimeline({ namespace: ns, workflow: wf, run: val });
    } else if (linkType === 'task-queue') {
      return routeForTaskQueue({ namespace: ns, queue: val });
    } else if (linkType === 'child-workflow') {
      return routeForTimeline({
        namespace: ns,
        workflow: attrs.workflowExecutionWorkflowId,
        run: attrs.workflowExecutionRunId,
      });
    } else if (linkType === 'nexus-endpoint') {
      return routeForNexusEndpoint(val);
    } else {
      return '';
    }
  }

  $: href = getHref(namespace, workflow, attributes, value, type);
</script>

<Link class={$$restProps.class} {href}>
  {value}
</Link>
