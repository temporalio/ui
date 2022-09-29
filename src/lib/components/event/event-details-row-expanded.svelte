<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import {
    routeForWorkflow,
    routeForWorkers,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
  import {
    getCodeBlockValue,
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayAsPlainText,
    shouldDisplayChildWorkflowLink,
    shouldDisplayParentWorkflowLink,
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

<article class="row flex px-4 first:pt-0 {$$props.class}">
  {#if typeof value === 'object'}
    <div class="code-block-row">
      <p class="text-sm">
        {format(key)}
      </p>
      <CodeBlock
        content={getCodeBlockValue(value)}
        class="w-full text-right lg:h-auto"
        {inline}
      />
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="detail-row">
      <p class="text-sm">{format(key)}</p>
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
  {:else if shouldDisplayParentWorkflowLink(key, attributes)}
    <div class="detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable content={value} container-class="xl:flex-row">
          <Link
            newTab
            href={routeForWorkflow({
              namespace: attributes.parentWorkflowNamespace,
              workflow: attributes.parentWorkflowExecutionWorkflowId,
              run: attributes.parentWorkflowExecutionRunId,
            })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <div class="detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable content={value} container-class="xl:flex-row">
          <Link newTab href={routeForTaskQueue({ namespace, queue: value })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="detail-row">
      <p class="text-sm">{format(key)}</p>
      <p class="text-sm">
        <span
          class="select-all px-2"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</article>

<style lang="postcss">
  .code-block-row {
    @apply block w-full border-b-2 border-gray-200 py-2 text-left;
  }
  .detail-row {
    @apply block w-full items-start gap-4 border-b-2 border-gray-200 py-2 text-left xl:flex;
  }
  .row:last-of-type .detail-row {
    @apply border-b-0;
  }
  .row:last-of-type .code-block-row {
    @apply border-b-0;
  }
  .badge {
    @apply bg-gray-300 text-gray-700;
  }
</style>
