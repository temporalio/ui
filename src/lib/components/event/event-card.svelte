<script lang="ts">
  import { page } from '$app/state';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Timestamp, { timestamp } from '$lib/components/timestamp.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Preview from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconCheckmark, IconChevronRight, IconLink } from '$lib/io/icon';
  import {
    resolveSystemNexusEvent,
    systemNexusInputRenderer,
    type SystemNexusLink,
  } from '$lib/system-nexus-endpoints';
  import type { EventLink as ELink } from '$lib/types';
  import { type Payload as RawPayload } from '$lib/types';
  import type { WorkflowEvent } from '$lib/types/events';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
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
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    displayLinkType,
    getCodeBlockValue,
    getStackTrace,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    humanizeEnumValue,
    isConfigurationField,
  } from '$lib/utilities/humanize-event-field';
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
    compact = false,
    previousEventTime = undefined,
    historyOwner = undefined,
    hiddenFields = [],
  }: {
    event: WorkflowEvent;
    lazy?: boolean;
    /** The operation's NexusOperationScheduled event, when this is part of a group. */
    initiatingEvent?: WorkflowEvent;
    /**
     * For a narrow container: one column, each label over its value. The
     * default layout follows the viewport, which a side panel doesn't.
     */
    compact?: boolean;
    /**
     * Compact only: the time of the event before this one in its group, so
     * this one can say how long after it came instead of repeating the date.
     */
    previousEventTime?: WorkflowEvent['eventTime'];
    /**
     * The workflow whose history this event belongs to, when that isn't the
     * page's own workflow: a nested child's event is numbered in the child's
     * history, so its links have to point there.
     */
    historyOwner?: { namespace: string; workflowId: string; runId: string };
    /**
     * Compact only: fields the surrounding view already shows, so the card
     * leaves them out. Matched by label, since one field can sit under
     * different keys from event to event.
     */
    hiddenFields?: readonly string[];
  } = $props();

  // Compact sets every size itself: a 12px label directly over a 14px value,
  // so each pair reads as one unit and the value reads first.
  const fieldRowClass = $derived(
    compact ? 'flex flex-col text-sm text-primary' : 'flex items-start gap-4',
  );
  const fieldLabelClass = $derived(
    compact ? 'text-xs text-secondary' : 'min-w-56 text-sm text-secondary',
  );
  const blockLabelClass = $derived(
    compact
      ? 'mb-1 text-xs text-secondary'
      : 'mb-1 min-w-56 text-sm text-secondary',
  );
  const { namespace, workflow, run } = $derived(
    historyOwner
      ? {
          namespace: historyOwner.namespace,
          workflow: historyOwner.workflowId,
          run: historyOwner.runId,
        }
      : page.params,
  );

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

  // In the compact layout what happened leads, and the settings that set the
  // event up wait behind a disclosure.
  const hiddenLabels = $derived(
    new Set(hiddenFields.map((key) => format(key))),
  );
  const isShown = ([key]: [string, unknown]) =>
    !compact || !hiddenLabels.has(format(key));
  const leadingDetailFields = $derived(
    compact
      ? detailFields.filter(
          (field) => !isConfigurationField(field[0]) && isShown(field),
        )
      : detailFields,
  );
  const configurationFields = $derived(
    compact
      ? detailFields.filter(
          (field) => isConfigurationField(field[0]) && isShown(field),
        )
      : [],
  );
  const shownLinkFields = $derived(linkFields.filter(isShown));
  const hasLeadingFields = $derived(
    Boolean(
      (event?.links?.length && !systemNexus) ||
      event?.userMetadata?.summary ||
      systemNexus?.links?.length ||
      leadingDetailFields.length ||
      shownLinkFields.length,
    ),
  );

  const { copy: copyLink, copied: linkCopied } = copyToClipboard();
  const eventUrl = () =>
    new URL(
      routeForEventHistoryEvent({
        eventId: event.id,
        run,
        workflow,
        namespace,
      }),
      window.location.origin,
    ).href;

  const sincePrevious = $derived(
    compact && previousEventTime && event.eventTime
      ? formatDistanceAbbreviated({
          start: previousEventTime,
          end: event.eventTime,
          includeMilliseconds: true,
        }) || '0ms'
      : undefined,
  );
</script>

{#if compact}
  <div
    class="group/step flex flex-1 cursor-default flex-col gap-3 bg-surface-primary py-4 pr-4 text-primary"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-2">
      <!-- The panel already shows this event in full, so its number is an
           id to match against other fields and logs, not a link. Sharing
           the event is a copy away instead. -->
      <div class="flex items-center gap-2 text-sm">
        <span class="font-mono tabular-nums text-secondary">#{event.id}</span>
        <p class="font-medium">
          {displayName}
        </p>
        <button
          type="button"
          class="flex size-5 items-center justify-center rounded text-secondary opacity-0 transition-opacity duration-150 ease-in-out hover:bg-interactive-tertiary-hover hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary group-hover/step:opacity-100 motion-reduce:transition-none"
          aria-label={$linkCopied
            ? translate('common.copy-success-icon-title')
            : translate('events.copy-event-link')}
          title={$linkCopied
            ? translate('common.copy-success-icon-title')
            : translate('events.copy-event-link')}
          onclick={(clickEvent) => copyLink(clickEvent, eventUrl())}
          data-testid="event-copy-link"
        >
          {#if $linkCopied}
            <IconCheckmark class="size-3.5" />
          {:else}
            <IconLink class="size-3.5" />
          {/if}
        </button>
      </div>
      {#if sincePrevious}
        <p
          class="text-xs tabular-nums text-secondary"
          title={$timestamp(event.eventTime)}
        >
          +{sincePrevious}
        </p>
      {:else}
        <Timestamp
          as="p"
          class="text-xs text-secondary"
          dateTime={event.eventTime}
        />
      {/if}
    </div>
    {#each payloadFields as [key, value] (key)}
      {@render payloads(key, value)}
    {/each}
    {#if hasLeadingFields}
      <div class="flex flex-col gap-3">
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
        {#each leadingDetailFields as [key, value] (key)}
          {@render details(key, value)}
        {/each}
        {#each shownLinkFields as [key, value] (key)}
          {@render link(key, value)}
        {/each}
      </div>
    {/if}
    {#if configurationFields.length}
      <details class="group/config">
        <summary
          class="flex w-fit cursor-pointer list-none items-center gap-1 rounded text-xs text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary [&::-webkit-details-marker]:hidden"
        >
          <IconChevronRight
            class="size-3 transition-transform duration-150 ease-in-out group-open/config:rotate-90 motion-reduce:transition-none"
          />
          {translate('events.configuration')} ({configurationFields.length})
        </summary>
        <div class="mt-3 flex flex-col gap-3">
          {#each configurationFields as [key, value] (key)}
            {@render details(key, value)}
          {/each}
        </div>
      </details>
    {/if}
  </div>
{:else}
  <div
    class="flex flex-1 cursor-default flex-col gap-2 border-b border-primary bg-surface-primary p-4 text-primary"
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
    <div class="flex flex-col {compact ? 'gap-3' : 'gap-1 xl:flex-row'}">
      <div class="flex w-full flex-col {compact ? 'gap-3' : 'gap-1 xl:w-1/2'}">
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
        <div
          class="flex w-full flex-col {compact ? 'gap-3' : 'gap-1 xl:w-1/2'}"
        >
          {#each payloadFields as [key, value] (key)}
            {@render payloads(key, value)}
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#snippet eventLink(view: EventLinkDisplay)}
  <div class={fieldRowClass}>
    <p class={fieldLabelClass}>
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
  <div class={fieldRowClass}>
    <p class={fieldLabelClass}>Summary</p>
    <PayloadSummary
      class="whitespace-pre-line"
      {value}
      fallback={translate('events.decode-failed')}
    >
      {#snippet children(decodedValue)}
        <Preview
          content={decodedValue}
          fill={false}
          compact
          singleLine
          minHeight={0}
          overrideTheme="primary"
          title={translate('workflows.summary')}
        />
      {/snippet}
    </PayloadSummary>
  </div>
{/snippet}

{#snippet payloads(key: string, value: Record<string, unknown>)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  {@const NexusInputRenderer = isRawPayload(codeBlockValue)
    ? systemNexusInputRenderer(codeBlockValue as RawPayload)
    : null}
  <div>
    <p class={blockLabelClass}>
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
      <p class={blockLabelClass}>
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
  <div class={fieldRowClass}>
    <p class={fieldLabelClass}>
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
  <div class={fieldRowClass}>
    <p class={fieldLabelClass}>
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
  {@const readable = compact ? humanizeEnumValue(key, value) : String(value)}
  <div class={fieldRowClass}>
    <p class={fieldLabelClass}>
      {format(key)}
    </p>
    <p
      class="whitespace-pre-line break-all"
      title={readable !== String(value) ? String(value) : undefined}
    >
      {#if shouldDisplayAsTime(key)}
        <Timestamp dateTime={value} />
      {:else}
        {readable}
      {/if}
    </p>
  </div>
{/snippet}
