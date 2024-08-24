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
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-view';
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
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: IterableEvent;
  export let group: EventGroup | undefined = undefined;
  export let initialItem: IterableEvent | undefined;
  export let index = 0;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  let selectedId = isEventGroup(event)
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
  $: descending = $eventFilterSort === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;
  $: attributes = formatAttributes(event);

  $: currentEvent = isEventGroup(event) ? event.events.get(selectedId) : event;
  $: elapsedTime = formatDistanceAbbreviated({
    start: initialItem?.eventTime,
    end: isEventGroup(event)
      ? event.initialEvent.eventTime
      : currentEvent.eventTime,
    includeMilliseconds: true,
  });

  $: duration = isEventGroup(event)
    ? formatDistanceAbbreviated({
        start: event.initialEvent.eventTime,
        end: event.lastEvent.eventTime,
        includeMilliseconds: true,
      })
    : '';

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);

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
    primaryAttribute.key,
  );
  $: pendingAttempt =
    isEventGroup(event) &&
    event.isPending &&
    (event?.pendingActivity?.attempt || event?.pendingNexusOperation?.attempt);
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
      <Link class="truncate px-2" data-testid="link" {href}>
        {event.id}
      </Link>
    </td>
  {:else}
    <td class="w-4" />
  {/if}
  <td
    class="w-full overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <div class="flex w-full items-center gap-2">
      <Icon name={icon} />
      <p
        class="event-name max-w-fit whitespace-nowrap pr-4 text-sm font-semibold md:text-base"
      >
        {displayName}
      </p>
      {#if isEventGroup(event) && event.pendingNexusOperation}
        <p class="text-sm">
          {event.pendingNexusOperation.state}
        </p>
      {/if}
      <div class="flex w-full gap-4 truncate">
        {#if pendingAttempt}
          <div class="flex items-center gap-1">
            <Icon
              class="mr-1.5 inline {pendingAttempt > 1
                ? 'text-red-700'
                : 'text-primary'}"
              name="retry"
            />
            {pendingAttempt}
          </div>
        {/if}
        <EventDetailsRow
          {...primaryAttribute}
          {attributes}
          showKey
          class="invisible h-0 w-0 md:visible md:h-auto md:w-auto"
        />
        {#if compact}
          <EventDetailsRow
            {...secondaryAttribute}
            {attributes}
            showKey
            class="invisible h-0 w-0 md:visible md:h-auto md:w-auto"
          />
        {/if}
      </div>
    </div>
  </td>
  <td>
    {#if isEventGroup(event)}
      <div class="flex items-center gap-0.5 px-2">
        {#each event.eventList as groupEvent}
          <Link class="truncate" data-testid="link" {href}>
            {groupEvent.id}
          </Link>
        {/each}
      </div>
    {:else}
      <div class="flex flex-col gap-0 px-2 text-right">
        {#if showElapsedTimeDiff}
          <p class="truncate text-sm">
            {#if elapsedTime}
              {descending ? '-' : '+'}{elapsedTime}
            {/if}
          </p>
          {#if duration && duration !== '0ms'}
            <div class="flex flex-row items-center gap-1">
              <Icon class="inline" name="clock" />
              <p class="truncate text-sm md:whitespace-normal">
                {duration}
              </p>
            </div>
          {/if}
        {:else}
          <p class="truncate text-sm">
            {formatDate(currentEvent?.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>
        {/if}
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
      <EventDetailsFull {group} event={currentEvent} {compact} />
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
