<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import {
    routeForWorkflow,
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

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let inline = false;

  const { workflow, namespace } = $page.params;
</script>

<article
  class="flex flex-row gap-2 border-b-2 border-gray-200 py-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
>
  {#if typeof value === 'object'}
    <p class="min-w-fit items-center text-sm xl:items-start">
      {format(key)}
    </p>
    <CodeBlock content={getCodeBlockValue(value)} class="w-[95%]" {inline} />
  {:else if shouldDisplayAsExecutionLink(key) && workflow && namespace}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <p class="mr-3 text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link
            newTab
            href={routeForWorkflow({ namespace, workflow, run: value })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayChildWorkflowLink(key, attributes)}
    <div class="detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable content={value} container-class="xl:flex-row">
          <Link
            newTab
            href={routeForWorkflow({
              namespace: attributes.namespace,
              workflow: attributes.workflowExecutionWorkflowId,
              run: attributes.workflowExecutionRunId,
            })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayAsTaskQueueLink(key) && namespace}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <p class="mr-3 text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link newTab href={routeForTaskQueue({ namespace, queue: value })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <p class="mr-3 text-sm">{format(key)}</p>
      <p class="text-right text-sm xl:text-left">
        <span
          class="select-all px-2 text-gray-700"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</article>

<style lang="postcss">
  .badge {
    @apply bg-gray-300;
  }
</style>
