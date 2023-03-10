<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
  import {
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayAsPlainText,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';

  import Link from '$lib/holocene/link.svelte';
  import Copyable from '../copyable.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import Badge from '$lib/holocene/badge.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let primary: boolean = false;

  const { workflow, namespace } = $page.params;
</script>

{#if typeof value !== 'object'}
  <div
    class="flex h-auto items-center justify-between gap-1"
    class:cell={!primary}
  >
    <p class="text-[12px]">{format(key)}</p>
    <Badge type={primary ? 'beta' : 'beta'}>
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
    </Badge>
  </div>
{/if}

<style lang="postcss">
  .row {
    @apply flex px-4 first:pt-0;
  }

  .content {
    @apply block w-full border-b-2 border-gray-200 py-2 text-left;
  }

  .code-block-row {
    @apply block w-full py-2 text-left;
  }

  .code-with-stack-trace {
    @apply flex flex-col gap-2 lg:flex-row;
  }

  .cell {
    @apply border-b-3 border-gray-500;
  }
</style>
