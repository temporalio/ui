<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import { type Payload } from '$lib/types';
  import type { WorkflowEvent } from '$lib/types/events';
  import { format } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsLink from './event-details-link.svelte';
  import EventLinksExpanded from './event-links-expanded.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let { event, title }: { event: WorkflowEvent; title?: Snippet } = $props();

  const attributes = $derived(formatAttributes(event));
  const fields = $derived(Object.entries(attributes));
  const payloadFields = $derived(
    fields.filter(
      ([_key, value]) =>
        typeof value === 'object' && Object.keys(value).length > 0,
    ),
  );
  const linkFields = $derived(
    fields.filter(
      ([key, _value]) => displayLinkType(key, attributes) !== 'none',
    ),
  );
  const detailFields = $derived(
    fields.filter(
      ([key, value]) =>
        typeof value !== 'object' &&
        displayLinkType(key, attributes) === 'none',
    ),
  );
</script>

<Card class="flex flex-1 flex-col gap-2 bg-primary">
  {@render title?.()}
  <div class="flex flex-1 flex-col gap-2 xl:flex-row">
    <div
      class="grid flex-1 {payloadFields.length
        ? 'grid-cols-2'
        : 'grid-cols-4'} items-start gap-2 overflow-hidden"
    >
      <EventLinksExpanded links={event?.links} />
      {#if event?.userMetadata?.summary}
        {@render eventSummary(event.userMetadata.summary)}
      {/if}
      {#each detailFields as [key, value] (key)}
        {@render details(key, value)}
      {/each}
      {#each linkFields as [key, value] (key)}
        {@render link(key, value)}
      {/each}
    </div>
    {#if payloadFields.length}
      <div class="w-full flex-1 overflow-hidden">
        {#each payloadFields as [key, value] (key)}
          {@render payloads(key, value)}
        {/each}
      </div>
    {/if}
  </div>
</Card>

<!-- {#snippet eventLinks(event?.links)}

{/snippet} -->

{#snippet eventSummary(value: Payload)}
  <div class="block w-full select-all px-2 py-1 text-left">
    <p class="font-mono text-sm text-secondary">Summary</p>
    <MetadataDecoder
      {value}
      let:decodedValue
      fallback={translate('events.decode-failed')}
    >
      {decodedValue}
    </MetadataDecoder>
  </div>
{/snippet}

{#snippet payloads(key, value)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div class="w-full">
    <div class="flex flex-col">
      <p class="font-mono text-sm text-secondary">
        {format(key)}
      </p>
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
        <p class="font-mono text-sm text-secondary">
          {translate('workflows.call-stack-tab')}
        </p>
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
{/snippet}

{#snippet link(key, value)}
  <div>
    <p class="font-mono text-sm text-secondary">
      {format(key)}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={String(value)}
    >
      <EventDetailsLink
        value={String(value)}
        {attributes}
        type={displayLinkType(key, attributes)}
        class="whitespace-pre-line"
      />
    </Copyable>
  </div>
{/snippet}

{#snippet details(key, value)}
  <div>
    <p class="font-mono text-sm text-secondary">
      {format(key)}
    </p>
    <p class="whitespace-pre-line">
      {shouldDisplayAsTime(key) ? formatDate(value, $timeFormat) : value}
    </p>
  </div>
{/snippet}
