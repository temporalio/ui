<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
  import {
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayAsPlainText,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';

  import Link from '$lib/holocene/link.svelte';
  import Copyable from '$lib/components/copyable.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import InfoPill from '$lib/holocene/info-pill.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let primary: boolean = false;

  const { workflow, namespace } = $page.params;
</script>

{#if typeof value !== 'object' && value}
  <div
    class="flex h-auto items-center justify-between gap-1"
    class:cell={!primary}
  >
    <InfoPill label={format(key)}>
      {#if shouldDisplayAsExecutionLink(key)}
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link
            newTab
            href={routeForEventHistory({
              namespace,
              workflow,
              run: value,
            })}
          >
            {value}
          </Link>
        </Copyable>
      {:else if shouldDisplayChildWorkflowLink(key, attributes)}
        <Copyable content={value} container-class="xl:flex-row">
          <Link
            newTab
            href={routeForEventHistory({
              namespace,
              workflow: attributes.workflowExecutionWorkflowId,
              run: attributes.workflowExecutionRunId,
            })}
          >
            {value}
          </Link>
        </Copyable>
      {:else if shouldDisplayAsTaskQueueLink(key)}
        <Copyable content={value} container-class="xl:flex-row">
          <Link newTab href={routeForTaskQueue({ namespace, queue: value })}>
            {value}
          </Link>
        </Copyable>
      {:else}
        <p class="select-all px-2" class:badge={!shouldDisplayAsPlainText(key)}>
          {value}
        </p>
      {/if}
    </InfoPill>
  </div>
{/if}
