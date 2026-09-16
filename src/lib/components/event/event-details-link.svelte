<script lang="ts">
  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import { type EventLinkType } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForNexusEndpoint,
    routeForTaskQueue,
    routeForWorkflow,
  } from '$lib/utilities/route-for';

  interface Props {
    value: string;
    attributes: CombinedAttributes;
    type: EventLinkType;
    class?: string;
  }

  let { value, attributes, type, class: className = '' }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const workflow = $derived(page.params.workflow);

  function getHref(
    ns: string,
    wf: string,
    attrs: CombinedAttributes,
    val: string,
    linkType: EventLinkType,
  ): string {
    if (linkType === 'execution') {
      return routeForWorkflow({ namespace: ns, workflow: wf, run: val });
    } else if (linkType === 'task-queue') {
      return routeForTaskQueue({ namespace: ns, queue: val });
    } else if (linkType === 'child-workflow') {
      return routeForWorkflow({
        namespace: ns,
        workflow: attrs.workflowExecutionWorkflowId ?? '',
        run: attrs.workflowExecutionRunId ?? '',
      });
    } else if (linkType === 'nexus-endpoint') {
      return routeForNexusEndpoint(val);
    } else {
      return '';
    }
  }

  const href = $derived(getHref(namespace, workflow, attributes, value, type));
</script>

<Link class={className} {href}>
  {value}
</Link>
