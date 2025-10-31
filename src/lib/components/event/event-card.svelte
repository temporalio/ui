<script lang="ts">
  import { cva } from 'class-variance-authority';

  import { page } from '$app/state';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
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
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let { event }: { event: WorkflowEvent } = $props();

  const displayName = $derived(
    isLocalActivityMarkerEvent(event)
      ? translate('events.category.local-activity')
      : spaceBetweenCapitalLetters(event.name),
  );
  const attributes = $derived(formatAttributes(event));
  const fields = $derived(Object.entries(attributes));
  const payloadFields = $derived(
    fields.filter(
      ([key, value]) =>
        typeof value === 'object' &&
        Object.keys(value).length > 0 &&
        key !== 'input' &&
        key !== 'result',
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

  const eventContainer = cva(
    [
      'flex flex-1 cursor-default flex-col gap-2 overflow-hidden rounded-t-md text-white shadow-md pb-2',
    ],
    {
      variants: {
        category: {
          workflow: 'bg-blue-800 ',
          activity: 'bg-purple-800 ',
          'child-workflow': 'bg-green-800 ',
          timer: 'bg-yellow-800 ',
          signal: 'bg-pink-800 ',
          update: 'bg-blue-800 ',
          other: 'bg-slate-800',
          nexus: 'bg-indigo-800',
          'local-activity': 'bg-slate-800 ',
          default: 'bg-purple-800 ',
        },
      },
    },
  );

  const eventTitle = cva(
    ['flex flex-wrap items-center justify-between gap-2 p-2'],
    {
      variants: {
        category: {
          workflow: 'bg-blue-900 ',
          activity: 'bg-purple-900 ',
          'child-workflow': 'bg-green-900 ',
          timer: 'bg-yellow-900 ',
          signal: 'bg-pink-900 ',
          update: 'bg-blue-900 ',
          other: 'bg-slate-900',
          nexus: 'bg-indigo-900',
          'local-activity': 'bg-slate-900 ',
          default: 'bg-purple-900 ',
        },
      },
    },
  );
</script>

<div
  class={eventContainer({
    category: event.category,
  })}
>
  <div
    class={eventTitle({
      category: event.category,
    })}
  >
    <div class="flex items-center gap-2 text-base">
      <p class="font-mono">{event.id}</p>
      <p class="font-medium">
        {displayName}
      </p>
    </div>
  </div>
  <div class="flex flex-col gap-1 px-2">
    <div class="flex w-full flex-col gap-0.5">
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
      <div class="flex w-full flex-col gap-1">
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
    <p class="text-sm text-white/70">
      {translate('nexus.link')}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={value}
    >
      <Link {href} class="whitespace-pre-line !text-white">{value}</Link>
    </Copyable>
  </div>
{/snippet}

{#snippet eventNamespaceLink(link: ELink)}
  {@const href = routeForNamespace({ namespace: link.workflowEvent.namespace })}
  <div class="flex items-start gap-4">
    <p class="text-sm text-white/70">
      {translate('nexus.link-namespace')}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={link.workflowEvent.namespace}
    >
      <Link {href} class="whitespace-pre-line !text-white"
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
    <p class="text-sm text-white/70">Summary</p>
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
    <p class="mb-1 text-sm text-white/70">
      {format(key)}
    </p>
    {#if value?.payloads}
      <PayloadDecoder {value} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={320}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else if key === 'searchAttributes'}
      <PayloadDecoder
        key="searchAttributes"
        value={{ searchAttributes: codeBlockValue }}
      >
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={320}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else}
      <PayloadDecoder value={codeBlockValue}>
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={320}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {/if}
  </div>
  {#if stackTrace}
    <div>
      <p class="mb-1 text-sm text-white/70">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        content={stackTrace}
        language="text"
        maxHeight={320}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/snippet}

{#snippet link(key, value)}
  <div class="flex items-start gap-4">
    <p class="text-sm text-white/70">
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
        class="whitespace-pre-line !text-white"
      />
    </Copyable>
  </div>
{/snippet}

{#snippet details(key, value)}
  <div class="flex items-start gap-4">
    <p class="text-sm text-white/70">
      {format(key)}
    </p>
    <p class="whitespace-pre-line break-all">
      {shouldDisplayAsTime(key) ? formatDate(value, $timeFormat) : value}
    </p>
  </div>
{/snippet}
