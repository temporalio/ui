<script lang="ts">
  import { page } from '$app/stores';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { format } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  import PayloadDecoder from './payload-decoder.svelte';

  export let key: string;
  export let value: string | number | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let inline = false;

  const { workflow, namespace } = $page.params;
  $: codeBlockValue = getCodeBlockValue(value);
  $: stackTrace = getStackTrace(codeBlockValue);
</script>

<div class="flex {$$props.class}">
  {#if typeof value === 'object'}
    <div class="content code-block-row">
      <div class="flex flex-col">
        <p class="text-sm">{format(key)}</p>
        {#if value?.payloads}
          <PayloadDecoder {value} key="payloads" let:decodedValue>
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              {inline}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {:else if key === 'searchAttributes'}
          <PayloadDecoder
            key="searchAttributes"
            value={{ searchAttributes: codeBlockValue }}
            let:decodedValue
          >
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              {inline}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {:else}
          <PayloadDecoder value={codeBlockValue} let:decodedValue>
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              {inline}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {/if}
      </div>
      {#if stackTrace && !inline}
        <div class="flex flex-col">
          <p class="text-sm">{translate('workflows.call-stack-tab')}</p>
          <CodeBlock
            content={stackTrace}
            language="text"
            class="mb-2 h-full lg:pr-2"
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/if}
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="badge text-sm">
        <Link
          href={routeForEventHistory({
            namespace,
            workflow,
            run: value.toString(),
          })}
        >
          {value}
        </Link>
      </div>
    </div>
  {:else if shouldDisplayChildWorkflowLink(key, attributes)}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="badge text-sm">
        <Link
          href={routeForEventHistory({
            namespace: attributes?.namespace || namespace,
            workflow: attributes.workflowExecutionWorkflowId,
            run: attributes.workflowExecutionRunId,
          })}
        >
          {value}
        </Link>
      </div>
    </div>
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <div class="badge text-sm">
        <Link href={routeForTaskQueue({ namespace, queue: value.toString() })}>
          {value}
        </Link>
      </div>
    </div>
  {:else}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <p class="text-sm">
        <span class="badge select-all break-all px-2">{value}</span>
      </p>
    </div>
  {/if}
</div>

<style lang="postcss">
  .content {
    @apply block w-full px-2 py-1 text-left;
  }

  .code-block-row {
    @apply block w-full py-1 text-left;
  }

  .detail-row {
    @apply flex w-full items-center gap-4 py-1 text-left xl:flex;
  }

  .badge {
    @apply surface-subtle rounded-sm px-1 py-0.5;
  }
</style>
