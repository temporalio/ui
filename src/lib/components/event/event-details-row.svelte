<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    shouldDisplayAsExecutionLink,
    shouldDisplayAsPlainText,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  import PayloadDecoder from './payload-decoder.svelte';

  export let key: string;
  export let value: string | Record<string, unknown> | Payloads;
  export let attributes: CombinedAttributes;

  const { workflow, namespace } = $page.params;
</script>

<div
  class="flex flex-row items-center gap-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
>
  {#if typeof value === 'object'}
    <div
      class="flex w-full items-center justify-between gap-2 pr-1 xl:flex-nowrap"
    >
      <PayloadDecoder {value} key="payloads" let:decodedValue>
        <CodeBlock
          content={decodedValue}
          inline
          thin
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </PayloadDecoder>
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="flex w-full items-center gap-2 pr-1">
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={value}
          container-class="xl:flex-row"
        >
          <Link
            class="truncate"
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
    <div class="flex w-full items-center gap-2 pr-1">
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={value}
          container-class="xl:flex-row"
        >
          <Link
            class="truncate"
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
    <div class="flex w-full items-center gap-2 pr-1">
      <div class="truncate text-sm">
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={value}
        >
          <Link
            class="truncate"
            href={routeForTaskQueue({ namespace, queue: value })}
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="flex w-full items-center gap-2 pr-1">
      <p class="truncate text-right text-sm xl:text-left">
        <span
          class="w-full select-all text-slate-700"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</div>

<style lang="postcss">
  .badge {
    @apply surface-subtle overflow-hidden rounded-sm p-1;
  }
</style>
