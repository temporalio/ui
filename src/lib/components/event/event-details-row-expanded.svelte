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

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Copyable from '../copyable.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let inline = false;

  const { workflow, namespace } = $page.params;
  $: codeBlockValue = getCodeBlockValue(value);
  $: stackTrace = getStackTrace(codeBlockValue);
</script>

<div class="row {$$props.class}">
  {#if typeof value === 'object'}
    <div
      class="content code-block-row"
      class:code-with-stack-trace={stackTrace}
    >
      <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
        <p class="text-sm">{format(key)}</p>
        <CodeBlock
          content={codeBlockValue}
          class="h-auto {stackTrace ? 'mb-2' : ''} max-h-96 overflow-auto"
          {inline}
        />
      </div>
      {#if stackTrace && !inline}
        <div class="flex flex-col lg:w-1/2">
          <p class="text-sm">Stack trace</p>
          <CodeBlock
            content={stackTrace}
            class="mb-2 h-full lg:pr-2"
            language="text"
          />
        </div>
      {/if}
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="text-sm">
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
      </div>
    </div>
  {:else if shouldDisplayChildWorkflowLink(key, attributes)}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="text-sm">
        <Copyable content={value} container-class="xl:flex-row">
          <Link
            newTab
            href={routeForEventHistory({
              namespace: attributes?.namespace || namespace,
              workflow: attributes.workflowExecutionWorkflowId,
              run: attributes.workflowExecutionRunId,
            })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <div class="content detail-row">
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
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <p class="text-sm">
        <span
          class="select-all px-2"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</div>

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

  .detail-row {
    @apply block w-full items-start gap-4 py-2 text-left xl:flex;
  }

  .row:last-of-type .content {
    @apply border-b-0;
  }

  .badge {
    @apply rounded-sm bg-gray-100 p-1 text-gray-900;
  }
</style>
