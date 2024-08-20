<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fade } from 'svelte/transition';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { isEventGroup } from '$lib/models/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-view';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: IterableEvent;
  export let initialItem: IterableEvent | undefined;
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
  $: attributes = formatAttributes(event, $timeFormat, $relativeTime);

  $: currentEvent = isEventGroup(event) ? event.events.get(selectedId) : event;
  $: elapsedTime = formatDistanceAbbreviated({
    start: initialItem.eventTime,
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
</script>

<tr
  class="row dense"
  id={event.id}
  class:expanded={expanded && !expandAll}
  class:active
  class:failure
  class:canceled
  class:terminated
  class:typedError
  data-testid="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="w-20 px-1 text-left">
    <Link class="truncate" data-testid="link" {href}>
      {event.id}
    </Link>
  </td>
  <td class="w-full text-right text-sm font-normal xl:text-left">
    <div class="flex">
      <div>
        {#if compact && failure}
          <Icon class="mr-1.5 inline text-red-700" name="clock" />
        {/if}
        {#if compact && canceled}
          <Icon class="mr-1.5 inline text-yellow-700" name="clock" />
        {/if}
        {#if compact && terminated}
          <Icon class="mr-1.5 inline text-pink-700" name="clock" />
        {/if}
      </div>
      <div class="flex w-full items-center gap-2">
        <Icon name={icon} />
        <p class="event-name truncate text-sm font-semibold md:text-base">
          {isEventGroup(event)
            ? event.displayName
            : isLocalActivityMarkerEvent(event)
            ? 'LocalActivity'
            : event.name}
        </p>
        <div class="grow truncate">
          <EventDetailsRow
            {...getSingleAttributeForEvent(
              isEventGroup(event) ? event.initialEvent : event,
            )}
            {attributes}
            class="invisible h-0 w-0 md:visible md:h-auto md:w-auto"
          />
        </div>
      </div>
    </div>
  </td>
  <td class="w-full overflow-hidden px-4">
    <div class="flex flex-col gap-0 text-right">
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
          {formatDate(event?.eventTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      {/if}
    </div>
  </td>
</tr>
{#if expanded}
  <tr in:fade|local class:typedError>
    <td class="expanded-cell" colspan="3">
      <EventDetailsFull {event} {currentEvent} {compact} bind:selectedId />
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
    @apply border-2 border-pink-50 dark:border-pink-700;
  }

  .terminated .event-name {
    @apply border-2 border-pink-700 dark:border-pink-50;
  }

  .expanded-cell {
    @apply flex px-4 text-sm no-underline xl:text-base;
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
