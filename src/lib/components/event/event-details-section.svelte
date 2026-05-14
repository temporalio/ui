<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    displayLinkType,
    shouldDisplayAsTime,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import {
    routeForEventHistoryEvent,
    routeForNamespace,
  } from '$lib/utilities/route-for';

  import EventDetailsLink from './event-details-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';

  let {
    event,
    group,
    attributes,
    detailFields,
    linkFields,
  }: {
    event: WorkflowEvent;
    group?: EventGroup;
    attributes: CombinedAttributes;
    detailFields: [string, unknown][];
    linkFields: [string, unknown][];
  } = $props();

  const { namespace, workflow, run } = $derived(page.params);

  const displayName = $derived(
    isLocalActivityMarkerEvent(event)
      ? translate('events.category.local-activity')
      : spaceBetweenCapitalLetters(event.name),
  );

  const durationSinceLastEvent = $derived.by(() => {
    if (!group) return '';
    const eventIndex = group.eventList.findIndex((evt) => evt.id === event.id);
    if (eventIndex === -1 || eventIndex === 0) return '';
    const previousEvent = group.eventList[eventIndex - 1];
    return formatDistanceAbbreviated({
      start: event.eventTime,
      end: previousEvent.eventTime,
      includeMilliseconds: true,
    });
  });
</script>

<div class="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
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
  <div class="flex flex-col items-end gap-0 font-mono text-sm leading-4">
    <Timestamp as="p" dateTime={event.eventTime} />
    {#if durationSinceLastEvent}
      <p class="font-medium text-secondary">+{durationSinceLastEvent}</p>
    {/if}
  </div>
</div>

{#if event?.links?.length}
  {#each event.links as link}
    {@const href = getEventLinkHref(link)}
    {@const value = href.split('workflows/')?.[1] || href}
    <div class="flex items-start gap-4">
      <p class="min-w-56 text-sm font-medium text-secondary">
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
    {@const nsHref = routeForNamespace({
      namespace: link.workflowEvent.namespace,
    })}
    <div class="flex items-start gap-4">
      <p class="min-w-56 text-sm font-medium text-secondary">
        {translate('nexus.link-namespace')}
      </p>
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={link.workflowEvent.namespace}
      >
        <Link href={nsHref} class="whitespace-pre-line"
          >{link.workflowEvent.namespace}</Link
        >
      </Copyable>
    </div>
  {/each}
{/if}

{#if event?.userMetadata?.summary}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm font-medium text-secondary">Summary</p>
    <p class="whitespace-pre-line">
      <MetadataDecoder
        value={event.userMetadata.summary}
        let:decodedValue
        fallback={translate('events.decode-failed')}
      >
        {decodedValue}
      </MetadataDecoder>
    </p>
  </div>
{/if}

{#each detailFields as [key, value] (key)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm font-medium text-secondary">
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
{/each}

{#each linkFields as [key, value] (key)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm font-medium text-secondary">
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
{/each}
