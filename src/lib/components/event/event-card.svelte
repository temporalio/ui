<script lang="ts">
  import { page } from '$app/state';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink as ELink } from '$lib/types';
  import { type Payload as RawPayload } from '$lib/types';
  import type { WorkflowEvent } from '$lib/types/events';
  import {
    type EventLinkDisplay,
    eventLinkTargetTypeLabel,
    toEventLinkViews,
  } from '$lib/utilities/event-link';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';

  let {
    event,
    lazy = false,
    showDetails = true,
  }: {
    event: WorkflowEvent;
    lazy?: boolean;
    showDetails?: boolean;
  } = $props();
  const { namespace, workflow, run } = $derived(page.params);

  const hasStructuredContent = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.some(hasStructuredContent);
    if (typeof value !== 'object' || value === null) {
      return value !== null && value !== undefined && value !== '';
    }
    return Object.values(value).some(hasStructuredContent);
  };

  const displayName = $derived(
    isLocalActivityMarkerEvent(event)
      ? translate('events.category.local-activity')
      : spaceBetweenCapitalLetters(event.name),
  );
  const attributes = $derived.by(() => {
    const attrs = formatAttributes(event);
    if (event?.principal?.name) attrs.principalName = event.principal.name;
    if (event?.principal?.type) attrs.principalType = event.principal.type;
    return attrs;
  });
  const fields = $derived(Object.entries(attributes));
  const payloadFields = $derived(
    fields.filter(
      ([_key, value]) =>
        typeof value === 'object' && hasStructuredContent(value),
    ),
  );
  const hasPayloadFields = $derived(payloadFields.length > 0);
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
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle {hasPayloadFields
    ? 'p-4'
    : 'p-3'}"
  data-testid="event-card"
  data-event-id={event.id}
  data-layout={hasPayloadFields ? 'payload' : 'attributes'}
  data-details-visible={showDetails}
>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex min-w-0 items-center gap-2 text-base">
      <Link
        class="shrink-0 font-mono tabular-nums"
        href={routeForEventHistoryEvent({
          eventId: event.id,
          run,
          workflow,
          namespace,
        })}>{event.id}</Link
      >
      <p class="truncate font-medium">
        {displayName}
      </p>
    </div>
    <Timestamp
      as="p"
      class="shrink-0 font-mono text-xs tabular-nums"
      dateTime={event.eventTime}
    />
  </div>
  {#if showDetails || hasPayloadFields}
    <div
      class="grid min-w-0 grid-cols-1 gap-3 {showDetails && hasPayloadFields
        ? 'xl:grid-cols-2'
        : ''}"
    >
      {#if showDetails}
        <div
          class="min-w-0 whitespace-normal {hasPayloadFields
            ? 'flex flex-col gap-1.5'
            : 'event-attribute-grid grid items-start gap-x-6 gap-y-2'}"
          data-testid="event-card-details"
        >
          {#if event?.links?.length}
            {#if event.category === 'nexus'}
              {@render nexusHandlerLinks(event.links)}
            {:else}
              {@render eventLinks(event.links)}
            {/if}
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
      {/if}
      {#if hasPayloadFields}
        <div
          class="flex min-w-0 flex-col gap-2"
          data-testid="event-card-payloads"
        >
          {#each payloadFields as [key, value] (key)}
            {@render payloads(key, value)}
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

{#snippet eventLink(view: EventLinkDisplay)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">
      {view.label}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={view.value}
      container-class="min-w-0"
    >
      {#if view.href}
        <Link href={view.href} class="whitespace-pre-line">{view.value}</Link>
      {:else}
        <span class="whitespace-pre-line">{view.value}</span>
      {/if}
    </Copyable>
  </div>
{/snippet}

{#snippet eventLinks(links: ELink[])}
  {#each toEventLinkViews(links, { namespace }) as view (view.key)}
    {@render eventLink(view)}
    {#if view.namespace}
      {@render eventLink(view.namespace)}
    {/if}
  {/each}
{/snippet}

{#snippet nexusHandlerLinks(links: ELink[])}
  {#each toEventLinkViews(links, { namespace }) as view (view.key)}
    {@const targetType = eventLinkTargetTypeLabel(view.variant)}
    {@render eventLink({
      label: translate('nexus.handler-target'),
      value: view.value,
      href: view.href,
    })}
    {#if targetType}
      {@render eventLink({
        label: translate('nexus.handler-target-type'),
        value: targetType,
      })}
    {/if}
    {#if view.namespace}
      {@render eventLink({
        label: translate('nexus.handler-namespace'),
        value: view.namespace.value,
        href: view.namespace.href,
      })}
    {/if}
  {/each}
{/snippet}

{#snippet eventSummary(value: RawPayload)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">Summary</p>
    <PayloadSummary
      class="whitespace-pre-line"
      {value}
      fallback={translate('events.decode-failed')}
    />
  </div>
{/snippet}

{#snippet payloads(key: string, value: Record<string, unknown>)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div class="min-w-0">
    <p class="mb-1 text-xs font-medium leading-5 text-secondary">
      {format(key)}
    </p>
    {#if value?.payloads}
      <PayloadCodeBlock
        filenameData={{
          workflowId: workflow,
          runId: run,
          eventId: event.id,
          type: key,
        }}
        label={format(key)}
        {value}
        maxHeight={384}
        {lazy}
      />
    {:else}
      <PayloadCodeBlock
        filenameData={{
          workflowId: workflow,
          runId: run,
          eventId: event.id,
          type: key,
        }}
        label={format(key)}
        value={codeBlockValue}
        maxHeight={384}
        {lazy}
      />
    {/if}
  </div>
  {#if stackTrace}
    <div class="min-w-0">
      <p class="mb-1 text-xs font-medium leading-5 text-secondary">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={stackTrace}
        label={translate('workflows.call-stack-tab')}
        language="text"
        maxHeight={384}
        {lazy}
      />
    </div>
  {/if}
{/snippet}

{#snippet link(key: string, value: string | number)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">
      {format(key)}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={String(value)}
      container-class="min-w-0"
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

{#snippet details(key: string, value: string | number)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">
      {format(key)}
    </p>
    <p class="min-w-0 whitespace-pre-line break-all text-sm leading-5">
      {#if shouldDisplayAsTime(key)}
        <Timestamp dateTime={value} />
      {:else}
        {value}
      {/if}
    </p>
  </div>
{/snippet}

<style lang="postcss">
  .event-attribute-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  }

  .event-attribute-grid > :global(*) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
</style>
