<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { format } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    getCodeBlockValue,
    shouldDisplayAsExecutionLink,
    shouldDisplayAsPlainText,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let inline = false;

  const { workflow, namespace } = $page.params;
</script>

<div
  class="flex flex-row items-center gap-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
>
  {#if typeof value === 'object'}
    <div
      class="flex w-full flex-wrap items-center pr-1 xl:flex-nowrap xl:gap-4"
    >
      <p class="min-w-fit text-sm">
        {format(key)}
      </p>
      <CodeBlock
        content={getCodeBlockValue(value)}
        {inline}
        copyIconTitle={translate('copy-icon-title')}
        copySuccessIconTitle={translate('copy-success-icon-title')}
      />
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="flex w-full flex-wrap items-center gap-1 pr-1">
      <p class="mr-3 truncate text-sm">{format(key)}</p>
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('copy-icon-title')}
          copySuccessIconTitle={translate('copy-success-icon-title')}
          content={value}
          container-class="xl:flex-row h-12 pr-1"
        >
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
      </div>
    </div>
  {:else if shouldDisplayChildWorkflowLink(key, attributes)}
    <div class="flex w-full flex-wrap items-center gap-1 pr-1">
      <p class="truncate text-sm">{format(key)}</p>
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('copy-icon-title')}
          copySuccessIconTitle={translate('copy-success-icon-title')}
          content={value}
          container-class="xl:flex-row h-12 pr-1"
        >
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
      </div>
    </div>
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <div class="flex w-full flex-wrap items-center gap-1 pr-1">
      <p class="mr-3 truncate text-sm">{format(key)}</p>
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('copy-icon-title')}
          copySuccessIconTitle={translate('copy-success-icon-title')}
          content={value}
          container-class="h-12 pr-1"
        >
          <Link
            class="truncate"
            newTab
            href={routeForTaskQueue({ namespace, queue: value })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="flex w-full flex-wrap items-center gap-1 pr-1">
      <p class="mr-3 truncate text-sm">{format(key)}</p>
      <p class="truncate text-right text-sm xl:text-left">
        <span
          class="w-full select-all text-gray-700"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</div>

<style lang="postcss">
  .badge {
    @apply rounded-sm bg-gray-100 p-1 text-gray-900;
  }
</style>
