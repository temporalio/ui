<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fade, slide } from 'svelte/transition';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
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

  export let event: IterableEvent;
  export let group: EventGroup | undefined = undefined;
  export let initialItem: IterableEvent | undefined;
  export let index = 0;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  let row: HTMLTableRowElement;

  $: selectedId = isEventGroup(event)
    ? Array.from(event.events.keys()).shift()
    : event.id;

  $: ({ workflow, run, namespace } = $page.params);
  $: href = routeForEventHistoryEvent({
    eventId: event.id,
    namespace,
    workflow,
    run,
  });
  $: expanded = expandAll;
  $: attributes = formatAttributes(event);

  $: currentEvent = isEventGroup(event) ? event.events.get(selectedId) : event;
  $: elapsedTime = formatDistanceAbbreviated({
    start: initialItem?.eventTime,
    end: isEventGroup(event)
      ? event.initialEvent?.eventTime
      : currentEvent.eventTime,
    includeMillisecondsForUnderSecond: true,
  });

  $: duration = isEventGroup(event)
    ? formatDistanceAbbreviated({
        start: event.initialEvent?.eventTime,
        end: event.lastEvent?.eventTime,
        includeMillisecondsForUnderSecond: true,
      })
    : '';

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const isHashRow = (hash: string) => {
    if (hash) {
      const id = hash.slice(1);
      return compact ? group?.eventIds.has(id) : event?.id === id;
    }
    return false;
  };

  const scrollToId = async (hash: string) => {
    if (isHashRow(hash)) {
      expanded = true;
      setTimeout(() => {
        row?.scrollIntoView({ behavior: 'smooth' });
        goto(location.pathname + location.search, { replaceState: true });
      }, 500);
    }
  };

  $: scrollToId($page.url.hash);

  $: failure = eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = eventOrGroupIsCanceled(event);
  $: terminated = eventOrGroupIsTerminated(event);

  $: displayName = isEventGroup(event)
    ? event.label
    : isLocalActivityMarkerEvent(event)
    ? 'Local Activity'
    : spaceBetweenCapitalLetters(event.name);

  $: primaryAttribute = getPrimaryAttributeForEvent(
    isEventGroup(event) ? event.initialEvent : event,
  );
  $: secondaryAttribute = getSecondaryAttributeForEvent(
    isEventGroup(event) ? event.lastEvent : event,
    primaryAttribute?.key,
  );
  $: hasPendingActivity = isEventGroup(event) && event?.pendingActivity;
  $: pendingAttempt =
    isEventGroup(event) &&
    event.isPending &&
    (event?.pendingActivity?.attempt || event?.pendingNexusOperation?.attempt);
  $: nonPendingActivityAttempt =
    isEventGroup(event) &&
    !event.isPending &&
    event.eventList.find(isActivityTaskStartedEvent)?.attributes?.attempt;
</script>

<tr
  bind:this={row}
  class="row dense"
  id={`${event.id}-${index}`}
  class:expanded={expanded && !expandAll}
  class:active
  class:failure
  class:canceled
  class:terminated
  class:typedError
  data-testid="event-summary-row"
  on:click|stopPropagation={onLinkClick}
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
      <Link data-testid="link" {href}>
        {event.id}
      </Link>
    </td>
  {/if}
  <td class="text-right md:hidden">
    <Tooltip
      hide={(isEventGroup(event) && !duration) || !elapsedTime}
      text={isEventGroup(event) ? `Duration: ${duration}` : `+${elapsedTime}`}
      bottom
    >
      {formatDate(currentEvent?.eventTime, $timeFormat, {
        relative: $relativeTime,
        abbrFormat: true,
      })}
    </Tooltip>
  </td>
  <td class="hidden text-right md:block">
    <Tooltip
      hide={(isEventGroup(event) && !duration) || !elapsedTime}
      text={isEventGroup(event) ? `Duration: ${duration}` : `+${elapsedTime}`}
      bottom
    >
      {formatDate(currentEvent?.eventTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </Tooltip>
  </td>
  <td class="truncate md:min-w-fit">
    <p class="event-name whitespace-nowrap font-semibold md:text-base">
      {displayName}
    </p>
  </td>
  <td
    class="hidden w-full items-center gap-2 text-right text-sm font-normal md:flex xl:text-left"
  >
    {#if pendingAttempt}
      <div
        class="flex items-center gap-1 {pendingAttempt > 1 &&
          'surface-retry px-1 py-0.5'}"
      >
        <Icon class="mr-1.5 inline" name="retry" />
        {translate('workflows.attempt')}
        {pendingAttempt}
        {#if hasPendingActivity}
          / {hasPendingActivity.maximumAttempts || '∞'}
          {#if pendingAttempt > 1}
            • {translate('workflows.next-retry')}
            {toTimeDifference({
              date: hasPendingActivity.scheduledTime,
              negativeDefault: 'None',
            })}
          {/if}
        {/if}
      </div>
    {/if}
    {#if currentEvent?.userMetadata?.summary}
      <MetadataDecoder
        value={currentEvent.userMetadata.summary}
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
        {:else}
          <EventDetailsRow {...primaryAttribute} {attributes} />
        {/if}
      </MetadataDecoder>
    {:else if primaryAttribute?.key}
      <EventDetailsRow {...primaryAttribute} {attributes} />
    {/if}
    {#if currentEvent?.links?.length}
      <EventLink
        link={currentEvent.links[0]}
        class="max-w-xl"
        linkClass="truncate"
      />
    {/if}
    {#if nonPendingActivityAttempt}
      <EventDetailsRow
        key="attempt"
        value={nonPendingActivityAttempt.toString()}
        {attributes}
      />
    {/if}
    {#if compact && secondaryAttribute?.key}
      <EventDetailsRow {...secondaryAttribute} {attributes} />
    {/if}
  </td>
</tr>
{#if expanded}
  <tr
    in:fade
    out:slide={{ duration: 175 }}
    class:typedError
    class="row expanded"
  >
    <td class="expanded-cell w-full">
      <EventDetailsFull {group} event={currentEvent} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex select-none items-center gap-4 px-2 text-sm no-underline;
  }

  .failure {
    @apply border border-danger;
  }

  .failure .event-name {
    @apply text-danger;
  }

  .canceled {
    @apply border border-warning;
  }

  .canceled .event-name {
    @apply text-warning;
  }

  .terminated {
    @apply border border-pink-700;
  }

  .terminated .event-name {
    @apply text-pink-700;
  }

  .expanded-cell {
    @apply text-sm no-underline;
  }

  .typedError .expanded-cell {
    @apply border-b-0;
  }
</style>
