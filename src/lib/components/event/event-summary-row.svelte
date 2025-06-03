<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import {
    decodeLocalActivity,
    getPrimaryAttributeForEvent,
    getSecondaryAttributeForEvent,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskStartedEvent,
    isLocalActivityMarkerEvent,
  } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';
  import EventLink from './event-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';
  const {
    event,
    group,
    initialItem,
    index,
    compact,
    typedError,
    active,
    onRowClick = () => {},
  } = $props();

  let expanded = $state(false);
  let primaryLocalAttribute = $state<SummaryAttribute | undefined>(undefined);

  const selectedId = $derived(() =>
    isEventGroup(event) ? Array.from(event.events.keys()).shift() : event.id,
  );

  const { workflow, run, namespace } = $page.params;

  const href = $derived(() =>
    routeForEventHistoryEvent({ eventId: event.id, namespace, workflow, run }),
  );

  const attributes = $derived(() => formatAttributes(event));

  const currentEvent = $derived(() =>
    isEventGroup(event) ? event.events.get(selectedId()) : event,
  );

  const elapsedTime = $derived(() =>
    formatDistanceAbbreviated({
      start: initialItem?.eventTime,
      end: isEventGroup(event)
        ? event.initialEvent?.eventTime
        : currentEvent()?.eventTime,
      includeMillisecondsForUnderSecond: true,
    }),
  );

  const duration = $derived(() =>
    isEventGroup(event)
      ? formatDistanceAbbreviated({
          start: event.initialEvent?.eventTime,
          end: event.lastEvent?.eventTime,
          includeMillisecondsForUnderSecond: true,
        })
      : '',
  );

  const failure = $derived(() => eventOrGroupIsFailureOrTimedOut(event));
  const canceled = $derived(() => eventOrGroupIsCanceled(event));
  const terminated = $derived(() => eventOrGroupIsTerminated(event));

  const displayName = $derived(() =>
    isEventGroup(event)
      ? event.label
      : isLocalActivityMarkerEvent(event)
        ? 'Local Activity'
        : spaceBetweenCapitalLetters(event.name),
  );

  const primaryAttribute = $derived(() =>
    !isLocalActivityMarkerEvent(event)
      ? getPrimaryAttributeForEvent(
          isEventGroup(event) ? event.initialEvent : event,
        )
      : undefined,
  );

  const secondaryAttribute = $derived(() =>
    getSecondaryAttributeForEvent(
      isEventGroup(event) ? event.lastEvent : event,
      primaryAttribute()?.key,
    ),
  );

  const hasPendingActivity = $derived(
    () => isEventGroup(event) && event?.pendingActivity,
  );

  const pendingAttempt = $derived(
    () =>
      isEventGroup(event) &&
      event.isPending &&
      (event?.pendingActivity?.attempt ||
        event?.pendingNexusOperation?.attempt),
  );

  const nonPendingActivityAttempt = $derived(
    () =>
      isEventGroup(event) &&
      !event.isPending &&
      event.eventList.find(isActivityTaskStartedEvent)?.attributes?.attempt,
  );

  const showSecondaryAttribute = $derived(
    () =>
      compact &&
      secondaryAttribute()?.key &&
      secondaryAttribute()?.key !== primaryAttribute()?.key &&
      !currentEvent()?.userMetadata?.summary,
  );

  const eventTime = $derived(() =>
    formatDate(currentEvent()?.eventTime, $timeFormat, {
      relative: $relativeTime,
    }),
  );

  const abbrEventTime = $derived(() =>
    formatDate(currentEvent()?.eventTime, $timeFormat, {
      relative: $relativeTime,
      abbrFormat: true,
    }),
  );

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  onMount(() => {
    if (isLocalActivityMarkerEvent(event))
      primaryLocalAttribute = decodeLocalActivity(event);
  });
  $inspect('primaryattr', primaryLocalAttribute);
</script>

<tr
  class="dense flex select-none items-center gap-4 px-2 text-sm no-underline"
  class:border={failure() || canceled() || terminated()}
  class:border-danger={failure()}
  class:border-warning={canceled()}
  class:border-pink-700={terminated()}
  class:typedError
  class:expanded
  class:active
  id={`${event.id}-${index}`}
  data-eventid={event.id}
  data-testid="event-summary-row"
  onclick={onLinkClick}
>
  {#if isEventGroup(event)}
    <td class="w-24 min-w-fit font-mono">
      <div class="flex items-center gap-0.5">
        {#each event.eventList as groupEvent}
          <Link
            data-testid="link"
            href={routeForEventHistoryEvent({
              eventId: groupEvent.id,
              namespace,
              workflow,
              run,
            })}
          >
            {groupEvent.id}
          </Link>
        {/each}
      </div>
    </td>
  {:else}
    <td class="font-mono">
      <Link data-testid="link" href={href()}>
        {event.id}
      </Link>
    </td>
  {/if}
  <td class="text-right md:hidden">
    <Tooltip
      hide={(isEventGroup(event) && !duration()) || !elapsedTime()}
      text={isEventGroup(event)
        ? `Duration: ${duration()}`
        : `+${elapsedTime()}`}
      bottom
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={abbrEventTime()}
      >
        {abbrEventTime()}
      </Copyable>
    </Tooltip>
  </td>
  <td class="hidden text-right md:block">
    <Tooltip
      hide={(isEventGroup(event) && !duration()) || !elapsedTime()}
      text={isEventGroup(event)
        ? `Duration: ${duration()}`
        : `+${elapsedTime()}`}
      bottom
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={eventTime()}
      >
        {eventTime()}
      </Copyable>
    </Tooltip>
  </td>
  <td class="truncate md:min-w-fit">
    <p
      class="whitespace-nowrap font-semibold md:text-base"
      class:text-danger={failure()}
      class:text-pink-700={terminated()}
      class:text-warning={canceled()}
    >
      {displayName()}
    </p>
  </td>
  <td
    class="hidden w-full items-center gap-2 text-right text-sm font-normal md:flex xl:text-left"
  >
    {#if pendingAttempt()}
      <div
        class="flex items-center gap-1 {pendingAttempt() > 1
          ? 'surface-retry px-1 py-0.5'
          : ''}"
      >
        <Icon class="mr-1.5 inline" name="retry" />
        {translate('workflows.attempt')}
        {pendingAttempt()}
        {#if hasPendingActivity()}
          / {hasPendingActivity().maximumAttempts || '∞'}
          {#if pendingAttempt() > 1}
            • {translate('workflows.next-retry')}
            {toTimeDifference({
              date: hasPendingActivity().scheduledTime,
              negativeDefault: 'None',
            })}
          {/if}
        {/if}
      </div>
    {/if}
    {#if !primaryLocalAttribute && primaryAttribute()?.key}
      <EventDetailsRow {...primaryAttribute()} attributes={attributes()} />
    {/if}
    {#if primaryLocalAttribute}
      <EventDetailsRow {...primaryLocalAttribute} attributes={attributes()} />
    {/if}
    {#if currentEvent()?.userMetadata?.summary}
      <MetadataDecoder
        value={currentEvent().userMetadata.summary}
        let:decodedValue
      >
        {#if decodedValue}
          <div
            class="flex max-w-xl items-center gap-2 first:pt-0 last:border-b-0 md:w-auto"
          >
            <p class="whitespace-nowrap text-right text-xs">Summary</p>
            <Badge type="secondary" class="block select-none truncate">
              {decodedValue}
            </Badge>
          </div>
        {/if}
      </MetadataDecoder>
    {/if}
    {#if currentEvent()?.links?.length}
      <EventLink
        link={currentEvent().links[0]}
        class="max-w-xl"
        linkClass="truncate"
      />
    {/if}
    {#if nonPendingActivityAttempt()}
      <EventDetailsRow
        key="attempt"
        value={nonPendingActivityAttempt().toString()}
        attributes={attributes()}
      />
    {/if}
    {#if showSecondaryAttribute()}
      <EventDetailsRow {...secondaryAttribute()} attributes={attributes()} />
    {/if}
  </td>
</tr>
{#if expanded}
  <tr
    in:fade
    out:slide={{ duration: 175 }}
    class:typedError
    class="expanded flex select-none items-center gap-4 px-2 text-sm no-underline"
  >
    <td class="w-full text-sm no-underline" class:border-b-0={typedError}>
      <EventDetailsFull {group} event={currentEvent()} />
    </td>
  </tr>
{/if}
