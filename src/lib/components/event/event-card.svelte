<script lang="ts">
  import { page } from '$app/state';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    resolveSystemNexusEvent,
    systemNexusInputRenderer,
    type SystemNexusLink,
  } from '$lib/system-nexus-endpoints';
  import type { EventLink as ELink } from '$lib/types';
  import { type Payload as RawPayload } from '$lib/types';
  import type { WorkflowEvent } from '$lib/types/events';
  import { isRawPayload } from '$lib/utilities/decode-payload';
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
  import {
    isLocalActivityMarkerEvent,
    isWorkflowExecutionSignaledEvent,
  } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';

  let {
    event,
    lazy = false,
    initiatingEvent = undefined,
  }: {
    event: WorkflowEvent;
    lazy?: boolean;
    /** The operation's NexusOperationScheduled event, when this is part of a group. */
    initiatingEvent?: WorkflowEvent;
  } = $props();
  const { namespace, workflow, run } = $derived(page.params);

  const systemNexus = $derived(
    resolveSystemNexusEvent(event, {
      namespace,
      workflow,
      run,
      initiatingEvent,
    }),
  );

  const attributes = $derived.by(() => {
    const attrs = formatAttributes(event);
    if (event?.principal?.name) attrs.principalName = event.principal.name;
    if (event?.principal?.type) attrs.principalType = event.principal.type;
    if (systemNexus?.attributes) {
      const extra = attrs as Record<string, unknown>;
      Object.assign(extra, systemNexus.attributes);
    }
    return attrs;
  });

  const displayName = $derived(
    systemNexus?.displayName ??
      (isLocalActivityMarkerEvent(event)
        ? translate('events.category.local-activity')
        : spaceBetweenCapitalLetters(event.name)),
  );

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
    const systemNexusFields = systemNexus?.hiddenFields ?? [];
    if (event.category === 'activity')
      return [
        ...systemNexusFields,
        'scheduledEventId',
        'startedEventId',
        'namespaceId',
      ];
    if (event.category === 'child-workflow')
      return [
        ...systemNexusFields,
        'initiatedEventId',
        'startedEventId',
        'namespaceId',
      ];
    return [...systemNexusFields, 'namespaceId'];
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
      <Link
        href={routeForEventHistoryEvent({
          eventId: event.id,
          run,
          workflow,
          namespace,
        })}>{event.id}</Link
      >
      <p class="font-medium">
        {displayName}
      </p>
    </div>
    <Timestamp as="p" class="text-sm" dateTime={event.eventTime} />
  </div>
  <div class="flex flex-col gap-1 xl:flex-row">
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {#if event?.links?.length && !systemNexus}
        {#if event.category === 'nexus'}
          {@render nexusHandlerLinks(event.links)}
        {:else if isWorkflowExecutionSignaledEvent(event)}
          {@render callerLinks(event.links)}
        {:else}
          {@render eventLinks(event.links)}
        {/if}
      {/if}
      {#if event?.userMetadata?.summary}
        {@render eventSummary(event.userMetadata.summary)}
      {/if}
      {#each systemNexus?.links ?? [] as extraLink (extraLink.label)}
        {@render systemNexusLink(extraLink)}
      {/each}
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

{#snippet eventLink(view: EventLinkDisplay)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {view.label}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={view.value}
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

{#snippet callerLinks(links: ELink[])}
  {#each toEventLinkViews( links, { namespace, perspective: 'caller' }, ) as view (view.key)}
    {@render eventLink({
      label: translate('nexus.caller-execution'),
      value: view.value,
      href: view.href,
    })}
    {#if view.event}
      {@render eventLink(view.event)}
    {/if}
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
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">Summary</p>
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
  {@const NexusInputRenderer = isRawPayload(codeBlockValue)
    ? systemNexusInputRenderer(codeBlockValue as RawPayload)
    : null}
  <div>
    <p class="mb-1 min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    {#if NexusInputRenderer}
      <NexusInputRenderer
        payload={codeBlockValue as RawPayload}
        maxHeight={384}
      />
    {:else if value?.payloads}
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
    <div>
      <p class="mb-1 min-w-56 text-sm text-secondary/80">
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

{#snippet systemNexusLink(nexusLink: SystemNexusLink)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {nexusLink.label}
    </p>
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={nexusLink.value}
    >
      {#if nexusLink.href}
        <Link href={nexusLink.href} class="whitespace-pre-line"
          >{nexusLink.value}</Link
        >
      {:else}
        <p class="whitespace-pre-line text-sm">{nexusLink.value}</p>
      {/if}
    </Copyable>
  </div>
{/snippet}

{#snippet link(key: string, value: string | number)}
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

{#snippet details(key: string, value: string | number)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    <p class="whitespace-pre-line break-all">
      {#if shouldDisplayAsTime(key)}
        <Timestamp dateTime={value} />
      {:else}
        {value}
      {/if}
    </p>
  </div>
{/snippet}
