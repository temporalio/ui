<script lang="ts">
  import { page } from '$app/state';

  import NexusOperationRenderer from '$lib/components/payload/nexus-operation-renderer.svelte';
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
  import { isRawPayload } from '$lib/utilities/decode-payload';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
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
    isNexusOperationCompletedEvent,
    isNexusOperationScheduledEvent,
  } from '$lib/utilities/is-event-type';
  import {
    describeNexusOperation,
    getSystemNexusLabelFromResponsePayload,
  } from '$lib/utilities/nexus-operation-registry';
  import {
    routeForEventHistoryEvent,
    routeForNamespace,
  } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';

  let { event }: { event: WorkflowEvent } = $props();
  const { namespace, workflow, run } = $derived(page.params);

  const attributes = $derived.by(() => {
    const attrs = formatAttributes(event);
    if (event?.principal?.name) attrs.principalName = event.principal.name;
    if (event?.principal?.type) attrs.principalType = event.principal.type;
    return attrs;
  });

  const SYSTEM_NEXUS_LABELS: Record<string, string> = {
    SignalWithStartWorkflowExecution: 'Signal With Start Operation',
    StartWorkflowExecution: 'Start Operation',
    SignalWorkflowExecution: 'Signal Operation',
    QueryWorkflow: 'Query Operation',
  };

  const nexusScheduledAttrs = $derived(
    isNexusOperationScheduledEvent(event)
      ? event.nexusOperationScheduledEventAttributes
      : null,
  );

  const nexusCompletedAttrs = $derived(
    isNexusOperationCompletedEvent(event)
      ? event.nexusOperationCompletedEventAttributes
      : null,
  );

  const isSystemNexusScheduled = $derived(
    nexusScheduledAttrs !== null &&
      String(nexusScheduledAttrs.endpoint ?? '') === '__temporal_system',
  );

  const isSystemNexusEvent = $derived(
    isSystemNexusScheduled || nexusCompletedAttrs !== null,
  );

  const systemNexusDescriptor = $derived.by(() => {
    if (!isSystemNexusScheduled || !nexusScheduledAttrs) return null;
    const input = nexusScheduledAttrs.input;
    if (!isRawPayload(input)) return null;
    return describeNexusOperation(input as RawPayload);
  });

  const systemNexusLabel = $derived.by(() => {
    if (isSystemNexusScheduled && nexusScheduledAttrs) {
      const op = String(nexusScheduledAttrs.operation ?? '');
      return SYSTEM_NEXUS_LABELS[op] ?? null;
    }
    if (nexusCompletedAttrs) {
      const result = nexusCompletedAttrs.result;
      if (isRawPayload(result))
        return getSystemNexusLabelFromResponsePayload(result as RawPayload);
    }
    return null;
  });

  const displayName = $derived.by(() => {
    if (systemNexusLabel) {
      const state = spaceBetweenCapitalLetters(
        event.name.replace('NexusOperation', ''),
      );
      return `${systemNexusLabel} ${state}`;
    }
    if (isLocalActivityMarkerEvent(event))
      return translate('events.category.local-activity');
    return spaceBetweenCapitalLetters(event.name);
  });
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
    const systemNexusFields = isSystemNexusEvent
      ? ['endpoint', 'service', 'operation', 'requestId']
      : [];
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
  {#each links as link (link)}
    {@render eventLink(link)}
    {@render eventNamespaceLink(link)}
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

{#snippet payloads(key, value)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  {@const nexusDescriptor = isRawPayload(codeBlockValue)
    ? describeNexusOperation(codeBlockValue as RawPayload)
    : null}
  <div>
    <p class="mb-1 min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    {#if nexusDescriptor}
      <NexusOperationRenderer
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
        {value}
        maxHeight={384}
      />
    {:else}
      <PayloadCodeBlock
        filenameData={{
          workflowId: workflow,
          runId: run,
          eventId: event.id,
          type: key,
        }}
        value={codeBlockValue}
        maxHeight={384}
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
        language="text"
        maxHeight={384}
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
      {#if shouldDisplayAsTime(key)}
        <Timestamp dateTime={value} />
      {:else}
        {value}
      {/if}
    </p>
  </div>
{/snippet}
