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
  import EventGroupDetailsWithTimeline from './event-group-details-with-timeline.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import PrimaryEventGroupDetails from './primary-event-group-details.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent | undefined;
  export let compact = true;
  export let hasSubGroup = false;
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  let selectedId = isEventGroup(event)
    ? Array.from(event.events.keys()).pop()
    : event.id;

  $: expanded = expandAll || active;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
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
        end: lastEvent?.eventTime,
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

  $: hasGroupEvents = event?.eventList?.length > 1;
</script>

<div class="flex gap-4">
  <div class="w-[120px] flex items-center justify-center h-full">
    <p
      class="w-[100px] text-center break-word truncate md:whitespace-normal md:text-[11px] leading-0"
    >
      {#if showElapsedTimeDiff}
        {formatDistanceAbbreviated({
          start: initialItem.eventTime,
          end: initialEvent.eventTime,
        })}
        {timeDiffChange}
      {:else}
        {formatDate(initialEvent?.eventTime, $timeFormat)}
      {/if}
    </p>
    <div class="w-[20px] flex flex-col items-center justify-center h-full">
      <div class="flex gap-0 w-[10x] h-1/2">
        <div class="w-[4px]" />
        <div class="w-[2px] bg-gray-900" />
        <div class="w-[4px]" />
      </div>
      <div
        class="grow"
        class:dot={!isSubGroup}
        class:subgroup-dot={isSubGroup}
        class:failure
        class:canceled
        class:terminated
      />
      <div class="flex gap-0 w-[10x] h-1/2">
        <div class="w-[4px]" />
        <div class="w-[2px] bg-gray-900" />
        <div class="w-[4px]" />
      </div>
    </div>
  </div>
  <div class="grow h-full">
    <EventCard thick={hasSubGroup}>
      <div
        class="row"
        id={lastEvent.id}
        class:expanded={expanded && !expandAll}
        aria-expanded={expanded || expandAll}
        class:active
        class:typedError
        data-testid="event-summary-row"
        on:click={onLinkClick}
        on:keydown={onLinkClick}
      >
        <div class="primary w-full flex justify-between cursor-pointer">
          <div class="flex items-center gap-4">
            <p class="truncate">{lastEvent.id}</p>
            <div class="flex" class:failure class:canceled class:terminated>
              <p
                class="event-name truncate text-sm font-semibold md:text-base xl:{isSubGroup
                  ? 'text-base'
                  : 'text-lg'}"
              >
                {isLocalActivityMarkerEvent(event)
                  ? 'LocalActivity'
                  : event.name}
              </p>
            </div>
            <PrimaryEventGroupDetails event={lastEvent} {hasGroupEvents} />
          </div>
          <div>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
          </div>
          <!-- <div
            class="flex items-center right-1 top-1 h-8 overflow-auto rounded"
          >
            <EventPayload
              {...getSingleAttributeForEvent(currentEvent)}
              {attributes}
              {expanded}
            />
          </div> -->
        </div>
        {#if expanded && hasGroupEvents}
          <div class="secondary">
            {#each event?.eventList.reverse() ?? [] as event}
              <EventGroupDetailsWithTimeline
                {event}
                {compact}
                bind:selectedId
              />
            {/each}
          </div>
        {/if}
      </div>
      {#if expanded && !hasGroupEvents}
        <div class="h-80">
          <CodeBlock content={stringifyWithBigInt(lastEvent)} />
        </div>
      {/if}
    </EventCard>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full rounded-xl flex-wrap items-center border-gray-900 text-sm no-underline pl-8 pr-2 xl:py-3 xl:text-base;
  }

  /* .row:hover {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  } */

  .secondary {
    @apply mt-4 flex flex-col gap-2;
  }

  .expanded.row {
    @apply bg-gray-50;
  }

  .dot {
    @apply rounded-full w-4 h-4 border-3 border-gray-900 bg-white;
  }

  .subgroup-dot {
    @apply rounded-full w-3 h-3 border-2 border-gray-900 bg-white;
  }

  .dot.failure {
    @apply bg-red-500;
  }

  .failure p {
    @apply text-red-700;
  }

  .dot.canceled {
    @apply bg-yellow-300;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .dot.terminated {
    @apply bg-pink-500;
  }

  .terminated p {
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
</style>
