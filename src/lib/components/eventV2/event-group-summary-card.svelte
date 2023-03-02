<script lang="ts">
  import { fade } from 'svelte/transition';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { eventShowElapsed, eventFilterSort } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';

  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsRow from '../event/event-details-row.svelte';
  import EventDetailsFull from '../event/event-details-full.svelte';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { noop } from 'svelte/internal';
  import { isEventGroup } from '$lib/models/event-groups';
  import { has } from '$lib/utilities/has';
  import { importEvents } from '$lib/stores/import-events';
  import EventPayload from './event-payload.svelte';
  import EventGroupPrimaryContent from './event-group-primary-content.svelte';
  import EventCard from './event-card.svelte';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent | undefined;
  export let compact = true;
  export let subGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  let selectedId = isEventGroup(event)
    ? Array.from(event.events.keys()).pop()
    : event.id;

  $: expanded = expandAll || active;

  $: currentEvent = isEventGroup(event) ? event.lastEvent : event;
  $: descending = $eventFilterSort === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;
  $: attributes = formatAttributes(event, { compact });

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: isEventGroup(previousItem)
          ? previousItem?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: currentEvent?.eventTime,
      });
      timeDiffChange = timeDiff ? `(${descending ? '-' : '+'}${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
</script>

<div class="flex gap-4">
  <div class="w-1/12 flex items-center justify-center">
    <p
      class="break-word truncate text-sm md:whitespace-normal md:text-[14px] w-auto"
    >
      {#if showElapsedTimeDiff}
        {formatDistanceAbbreviated({
          start: initialItem.eventTime,
          end: currentEvent.eventTime,
        })}
        {timeDiffChange}
      {:else}
        {formatDate(currentEvent?.eventTime, $timeFormat)}
      {/if}
    </p>
    <div class="rounded-full w-6 h-4 border-3 border-gray-900 bg-white" />
  </div>
  <div class="w-11/12">
    <EventCard thick={subGroup}>
      <div
        class="row"
        id={currentEvent.id}
        class:expanded={expanded && !expandAll}
        aria-expanded={expanded || expandAll}
        class:active
        class:failure
        class:canceled
        class:terminated
        class:typedError
        data-testid="event-summary-row"
        on:click={onLinkClick}
      >
        <div class="primary w-full flex justify-between">
          <div class="flex items-center gap-4">
            <p class="truncate">{currentEvent.id}</p>
            <div class="flex">
              {#if compact && failure}
                <Icon class="mr-1.5 inline text-red-700" name="clock" />
              {/if}
              {#if compact && canceled}
                <Icon class="mr-1.5 inline text-yellow-700" name="clock" />
              {/if}
              {#if compact && terminated}
                <Icon class="mr-1.5 inline text-pink-700" name="clock" />
              {/if}
              <p class="event-name truncate text-sm font-semibold md:text-base">
                {isLocalActivityMarkerEvent(currentEvent)
                  ? 'LocalActivity'
                  : currentEvent.name}
              </p>
            </div>
            <EventGroupPrimaryContent
              {...getSingleAttributeForEvent(currentEvent)}
              {attributes}
              class="invisible h-0 w-0 md:visible md:h-auto md:w-auto"
              inline
            />
          </div>
          <div
            class="flex items-center right-1 top-1 h-8 overflow-auto rounded"
          >
            <EventPayload
              {...getSingleAttributeForEvent(currentEvent)}
              {attributes}
              {expanded}
            />
          </div>
        </div>
        <div class="secondary">
          {#if expanded}
            <EventDetailsFull
              event={currentEvent}
              {currentEvent}
              {compact}
              bind:selectedId
            />
          {/if}
        </div>
      </div>
    </EventCard>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full rounded-xl flex-wrap items-center border-gray-900 text-sm no-underline pl-8 pr-2 xl:py-3 xl:text-base;
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
    @apply table-cell w-full flex-wrap text-sm no-underline xl:text-base;
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
