<script lang="ts">
  import { page } from '$app/state';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { EventLink as ELink } from '$lib/types';
  import { type Payload } from '$lib/types';
  import type { WorkflowEvent } from '$lib/types/events';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let { event }: { event: WorkflowEvent } = $props();

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

  const hiddenDetailFields = $derived.by(() => {
    if (event.category === 'activity')
      return ['scheduledEventId', 'startedEventId', 'namespaceId'];
    if (event.category === 'child-workflow')
      return ['initiatedEventId', 'startedEventId', 'namespaceId'];
    return ['namespaceId'];
  });
  const detailFields = $derived(
    fields.filter(
      ([key, value]) =>
        typeof value !== 'object' &&
        displayLinkType(key, attributes) === 'none' &&
        !hiddenDetailFields.includes(key) &&
        (key !== 'namespace' ||
          (key === 'namespace' && page.params.namespace !== value)),
    ),
  );
</script>

<div
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle p-4"
>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2 text-base">
      <p class="font-mono">{event.id}</p>
      <p class="font-medium">
        {spaceBetweenCapitalLetters(event.name)}
      </p>
    </div>
    <p class="text-sm">
      {formatDate(event.eventTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="flex flex-col gap-1 xl:flex-row">
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {#if event?.links?.length}
        {@render eventLinks(event.links)}
      {/if}
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
      <div class="flex w-full flex-col gap-1 xl:w-1/2">
        {#each payloadFields as [key, value] (key)}
          {@render payloads(key, value)}
        {/each}
      </div>
    {/if}
  </div>
</div>

{#snippet eventLink(link: ELink)}
  {@const href = getEventLinkHref(link)}
  {@const value = href.split('workflows/')?.[1] || href}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {translate('nexus.link')}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={value}
    >
      <Link {href} class="whitespace-pre-line">{value}</Link>
    </Copyable>
  </div>
{/snippet}

{#snippet eventNamespaceLink(link: ELink)}
  {@const href = routeForNamespace({ namespace: link.workflowEvent.namespace })}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {translate('nexus.link-namespace')}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={link.workflowEvent.namespace}
    >
      <Link {href} class="whitespace-pre-line"
        >{link.workflowEvent.namespace}</Link
      >
    </Copyable>
  </div>
{/snippet}

{#snippet eventLinks(links: ELink[])}
  {#each links as link}
    {@render eventLink(link)}
    {@render eventNamespaceLink(link)}
  {/each}
{/snippet}

{#snippet eventSummary(value: Payload)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">Summary</p>
    <p class="whitespace-pre-line">
      <MetadataDecoder
        {value}
        let:decodedValue
        fallback={translate('events.decode-failed')}
      >
        {decodedValue}
      </MetadataDecoder>
    </p>
  </div>
{/snippet}

{#snippet payloads(key, value)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div>
    <p class="mb-1 min-w-56 text-sm text-secondary/80">
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
    <div>
      <p class="mb-1 min-w-56 text-sm text-secondary/80">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        content={stackTrace}
        language="text"
        maxHeight={384}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/snippet}

{#snippet link(key, value)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
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
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    <p class="whitespace-pre-line break-all">
      {shouldDisplayAsTime(key) ? formatDate(value, $timeFormat) : value}
    </p>
  </div>
{/snippet}
