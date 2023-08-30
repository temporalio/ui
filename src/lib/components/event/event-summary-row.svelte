<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fade } from 'svelte/transition';

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

  $: expanded = expandAll || active;

  $: descending = $eventFilterSort === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;
  $: attributes = formatAttributes(event, { compact });

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
</script>

<tr
  class="row"
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
  <td />
  <td class="w-24 text-left">
    <Link class="truncate" href="#{event.id}">{event.id}</Link>
  </td>
  <td class="text-left">
    <div class="flex flex-col gap-0">
      {#if showElapsedTimeDiff}
        <p class="break-word truncate text-sm md:whitespace-normal">
          {#if elapsedTime}
            {descending ? '-' : '+'}{elapsedTime}
          {/if}
        </p>
        {#if duration && duration !== '0ms'}
          <div class="flex flex-row items-center gap-0">
            <Icon class="inline" name="clock" />
            <p class="break-word truncate text-sm md:whitespace-normal">
              {duration}
            </p>
          </div>
        {/if}
      {:else}
        <p
          class="break-word truncate text-sm md:whitespace-normal md:text-base"
        >
          {formatDate(event?.eventTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      {/if}
    </div>
  </td>
  <td
    colspan={expanded ? 2 : 1}
    class="text-right text-sm font-normal xl:text-left"
  >
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
      <div class="flex w-full items-center justify-between truncate">
        <p class="event-name truncate text-sm font-semibold md:text-base">
          {isLocalActivityMarkerEvent(event) ? 'LocalActivity' : event.name}
        </p>
        {#if expanded}
          <div>
            <Icon class="inline" name="chevron-up" />
          </div>
        {/if}
      </div>
    </div>
  </td>
  {#if !expanded}
    <td class="overflow-hidden">
      <div class="flex w-full items-center justify-between">
        <div class="grow">
          <EventDetailsRow
            {...getSingleAttributeForEvent(currentEvent)}
            {attributes}
            class="invisible h-0 w-0 md:visible md:h-auto md:w-auto"
            inline
          />
        </div>
        <div>
          <Icon class="inline" name="chevron-down" />
        </div>
      </div>
    </td>
  {/if}

  <td />
</tr>
{#if expanded}
  <tr in:fade|local class:typedError>
    <td class="expanded-cell" colspan="6">
      <EventDetailsFull {event} {currentEvent} {compact} bind:selectedId />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex-wrap items-center border-gray-900 text-sm no-underline xl:py-3 xl:text-base;
  }

  .row:hover {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }

  .expanded.row {
    @apply bg-blue-50;
  }

  .failure {
    @apply bg-red-50;
  }

  .failure .event-name {
    @apply text-red-700;
  }

  .canceled {
    @apply bg-yellow-50;
  }

  .canceled .event-name {
    @apply text-yellow-700;
  }

  .terminated {
    @apply bg-pink-50;
  }

  .terminated .event-name {
    @apply text-pink-700;
  }

  .expanded-cell {
    @apply w-full flex-wrap text-sm no-underline xl:text-base;
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

  .active {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }

  .canceled:hover,
  .active.canceled {
    @apply bg-gradient-to-br from-yellow-100 to-yellow-200 bg-fixed;
  }

  .failure:hover,
  .active.failure {
    @apply bg-gradient-to-br from-red-100 to-red-200 bg-fixed;
  }

  .terminated:hover,
  .active.terminated {
    @apply bg-gradient-to-br from-pink-100 to-pink-200 bg-fixed;
  }
</style>
