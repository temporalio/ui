<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import { format } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsLink from './event-details-link.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  export let key: string;
  export let value: string | number | Record<string, unknown>;
  export let attributes: CombinedAttributes;

  $: codeBlockValue = getCodeBlockValue(value);
  $: stackTrace = getStackTrace(codeBlockValue);
  $: linkType = displayLinkType(key, attributes);
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
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {:else}
          <PayloadDecoder value={codeBlockValue} let:decodedValue>
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {/if}
      </div>
      {#if stackTrace}
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
  {:else if linkType !== 'none'}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={String(value)}
      >
        <EventDetailsLink
          value={String(value)}
          {attributes}
          type={linkType}
          class="whitespace-pre-line"
        />
      </Copyable>
    </div>
  {:else}
    <div class="content detail-row">
      <p class="text-sm">{format(key)}</p>
      <Badge type="subtle" class="inline-block whitespace-pre-wrap">
        {shouldDisplayAsTime(key) ? formatDate(value, $timeFormat) : value}
      </Badge>
    </div>
  {/if}
</div>

<style lang="postcss">
  .content {
    @apply block w-full px-2 py-1 text-left;
  }

  .code-block-row {
    @apply block w-full select-all py-1 text-left;
  }

  .detail-row {
    @apply flex w-full items-center gap-2 py-1 text-left;
  }
</style>
