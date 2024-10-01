<script lang="ts">
  import { page } from '$app/stores';

  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
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

  $: executionLink = routeForEventHistory({
    namespace,
    workflow,
    run: value,
  });
  $: taskQueueLink = routeForTaskQueue({ namespace, queue: value });
  $: childWorkflowLink = routeForEventHistory({
    namespace,
    workflow: attributes.workflowExecutionWorkflowId,
    run: attributes.workflowExecutionRunId,
  });
  $: nexusEndpointLink = routeForNexusEndpoint(value);

  $: hrefs = {
    execution: executionLink,
    'task-queue': taskQueueLink,
    'child-workflow': childWorkflowLink,
    'nexus-endpoint': nexusEndpointLink,
  } as Record<Exclude<EventLinkType, 'none'>, string>;

  $: href = hrefs[type];
</script>

<Copyable
  copyIconTitle={translate('common.copy-icon-title')}
  copySuccessIconTitle={translate('common.copy-success-icon-title')}
  content={value}
>
  <Badge type="subtle" class="select-none">
    <Link class="truncate break-all" {href}>
      {value}
    </Link>
  </Badge>
</Copyable>
