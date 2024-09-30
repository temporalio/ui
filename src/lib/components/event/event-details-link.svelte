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

  $: hrefs = {
    execution: routeForEventHistory({
      namespace,
      workflow,
      run: value,
    }),
    'task-queue': routeForTaskQueue({ namespace, queue: value }),
    'child-workflow': routeForEventHistory({
      namespace,
      workflow: attributes.workflowExecutionWorkflowId,
      run: attributes.workflowExecutionRunId,
    }),
    'nexus-endpoint': routeForNexusEndpoint(value),
  };

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
