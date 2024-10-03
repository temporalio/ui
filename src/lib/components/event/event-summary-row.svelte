<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fade, slide } from 'svelte/transition';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
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

  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';
  import EventLink from './event-link.svelte';

  export let event: IterableEvent;
  export let group: EventGroup | undefined = undefined;
  export let initialItem: IterableEvent | undefined;
  export let index = 0;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  $: selectedId = isEventGroup(event)
    ? Array.from(event.events.keys()).pop()
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
      ? event.initialEvent.eventTime
      : currentEvent.eventTime,
    includeMillisecondsForUnderSecond: true,
  });

  $: duration = isEventGroup(event)
    ? formatDistanceAbbreviated({
        start: event.initialEvent.eventTime,
        end: event.lastEvent.eventTime,
        includeMillisecondsForUnderSecond: true,
      })
    : '';

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  $: failure = eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = eventOrGroupIsCanceled(event);
  $: terminated = eventOrGroupIsTerminated(event);

  $: icon = isLocalActivityMarkerEvent(event)
    ? CategoryIcon['local-activity']
    : CategoryIcon[event.category];

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
  {#if !compact}
    <td class="w-12 text-left">
      <Link class="truncate px-1" data-testid="link" {href}>
        {event.id}
      </Link>
    </td>
  {:else}
    <td class="w-4" />
  {/if}
  <td
    class="flex w-full items-center gap-2 overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <Icon name={icon} />
    <p
      class="event-name max-w-fit whitespace-nowrap text-sm font-semibold md:text-base"
    >
      {displayName}
    </p>
    {#if pendingAttempt}
      <div
        class="flex items-center gap-1 {pendingAttempt > 1 &&
          'surface-danger rounded px-1 py-0.5'}"
      >
        <Icon class="mr-1.5 inline" name="retry" />
        {pendingAttempt}
        {#if hasPendingActivity}
          / {hasPendingActivity.maximumAttempts || '∞'}
        {/if}
      </div>
    {/if}
    {#if currentEvent?.links?.length}
      <EventLink link={currentEvent.links[0]} />
    {/if}
    {#if primaryAttribute?.key}
      <EventDetailsRow {...primaryAttribute} {attributes} />
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
  <td>
    {#if isEventGroup(event)}
      <div class="flex items-center gap-2 px-2">
        <div class="flex gap-0.5">
          {#each event.eventList as groupEvent}
            <Link
              class="truncate"
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
        {#if duration && duration !== '0ms'}
          <div class="flex items-center gap-1 text-sm text-secondary">
            <Icon class="inline" name="clock" />
            <p class="whitespace-noline truncate">
              {duration}
            </p>
          </div>
        {/if}
        {#if pendingAttempt > 1 && hasPendingActivity}
          <div class="flex items-center gap-2 text-sm">
            <p class="max-w-fit whitespace-nowrap text-right text-xs">
              Next Retry
            </p>
            <p class="flex items-center gap-0">
              <Icon class="mr-1.5 inline" name="clock" />
              {toTimeDifference({
                date: hasPendingActivity.scheduledTime,
                negativeDefault: 'None',
              })}
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col gap-0 px-2 text-right">
        <p class="-mb-1 truncate text-xs leading-3 text-secondary">
          {#if elapsedTime}
            +{elapsedTime}
          {/if}
        </p>
        <p class="truncate text-sm">
          {formatDate(currentEvent?.eventTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      </div>
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
    <td class="expanded-cell w-full" colspan="3">
      <EventDetailsFull {group} event={currentEvent} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex select-none items-center text-sm no-underline;
  }

  .failure {
    @apply border-2 border-danger;
  }

  .failure .event-name {
    @apply text-danger;
  }

  .canceled {
    @apply border-2 border-warning;
  }

  .canceled .event-name {
    @apply text-warning;
  }

  .terminated {
    @apply border-2 border-pink-700;
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

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }
</style>
