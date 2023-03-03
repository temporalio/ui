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
    getCodeBlockValue,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Copyable from '../copyable.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import Badge from '$lib/holocene/badge.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let inline = false;

  const { workflow, namespace } = $page.params;
</script>

{#if typeof value !== 'object'}
  <div
    class="flex flex-row items-center gap-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
  >
    {#if shouldDisplayAsExecutionLink(key)}
      <div class="flex w-full flex-wrap items-center gap-1 pr-1">
        <p class="mr-3 truncate text-sm">{format(key)}</p>
        <Badge type="blue" class="truncate text-sm">
          <Copyable content={value} container-class=" xl:flex-row">
            <Link
              class="truncate"
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
        </Badge>
      </div>
    {:else if shouldDisplayChildWorkflowLink(key, attributes)}
      <div class="flex w-full flex-wrap items-center gap-1 pr-1">
        <p class="truncate text-sm">{format(key)}</p>
        <Badge type="blue" class="truncate text-sm">
          <Copyable content={value} container-class="xl:flex-row">
            <Link
              class="truncate"
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
        </Badge>
      </div>
    {:else if shouldDisplayAsTaskQueueLink(key)}
      <div class="flex w-full flex-wrap items-center gap-1 pr-1">
        <p class="mr-3 truncate text-sm">{format(key)}</p>
        <Badge type="blue" class="truncate text-sm">
          <Copyable content={value} container-class="">
            <Link
              class="truncate"
              newTab
              href={routeForTaskQueue({ namespace, queue: value })}
            >
              {value}
            </Link>
          </Copyable>
        </Badge>
      </div>
    {:else}
      <div class="flex w-full flex-wrap items-center gap-1 pr-1">
        <Badge type="blue" class="truncate text-sm">{value}</Badge>
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .badge {
    @apply rounded-sm bg-gray-100 p-1 text-gray-900;
  }
</style>
