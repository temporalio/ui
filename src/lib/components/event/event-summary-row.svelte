<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import { eventSortOrder, eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowEventsColumnWidth,
    workflowEventsResponsiveColumnWidth,
  } from '$lib/stores/column-width';

  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsRow from './event-details-row.svelte';
  import EventDetailsFull from './event-details-full.svelte';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  export let event: IterableEvent | EventGroup;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent;
  export let active = false;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;

  let selectedId = compact
    ? Array.from((event as EventGroup).events.keys()).pop()
    : event.id;

  $: expanded = expandAll;

  $: currentEvent = compact
    ? (event as EventGroup).events.get(selectedId)
    : event;
  $: descending = $eventSortOrder === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';
  $: attributes = formatAttributes(event, { compact });

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: compact
          ? (previousItem as EventGroup)?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: compact ? currentEvent?.eventTime : event?.eventTime,
      });
      timeDiffChange = timeDiff ? `(${descending ? '-' : '+'}${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
  };

  const failure = eventOrGroupIsFailureOrTimedOut(compact && event);
  const canceled = eventOrGroupIsCanceled(compact && event);
  const terminated = eventOrGroupIsTerminated(compact && event);

  let truncateWidth: number;
  workflowEventsColumnWidth.subscribe((value) => {
    if (value !== 0) truncateWidth = value;
  });
  workflowEventsResponsiveColumnWidth.subscribe((value) => {
    if (value !== 0) truncateWidth = value;
  });
</script>

<div
  class="row"
  id={event.id}
  class:expanded={expanded && !expandAll}
  class:failure
  class:canceled
  class:terminated
  class:typedError
  class:active
  data-cy="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <div class="w-24 text-left">
    <a class="text-sm text-gray-500 md:text-base" href="#{event.id}"
      ><p class="truncate">{event.id}</p></a
    >
  </div>
  <div class="flex w-auto text-left">
    <p class="pr-2 text-sm md:text-base">
      {#if showElapsed && event.id !== initialItem.id}
        {formatDistanceAbbreviated({
          start: initialItem.eventTime,
          end: currentEvent.eventTime,
        })}
        {timeDiffChange}
      {:else}
        {formatDate(event?.eventTime, $timeFormat)}
      {/if}
    </p>
  </div>
  <div class="text-right w-96 text-sm font-normal xl:text-left">
    <div tabindex="0" class="flex items-center">
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
        {isLocalActivityMarkerEvent(event) ? 'LocalActivity' : event.name}
      </p>
      {#if compact}
        <Icon
          class="ml-1.5 inline"
          name={expanded ? 'chevron-up' : 'chevron-down'}
        />
      {/if}
    </div>
  </div>
  <div class="links table-cell items-center">
    <div class="flex justify-between">
      <div class="invisible w-full md:visible">
        {#if !expanded && !compact}
          <EventDetailsRow
            {...getSingleAttributeForEvent(currentEvent)}
            {attributes}
            inline
          />
        {/if}
      </div>
      <div class="w-4">
        {#if !compact}
          <Icon
            class="inline"
            name={expanded ? 'chevron-up' : 'chevron-down'}
          />
        {/if}
      </div>
    </div>
  </div>
</div>
{#if expanded}
  <div class="border border-gray-900 border-b-0 border-t-0 " class:typedError>
    <div class="expanded-cell" colspan="6">
      <EventDetailsFull
        event={currentEvent}
        {compact}
        eventGroup={event}
        bind:selectedId
      />
    </div>
  </div>
{/if}

<style lang="postcss">
  .row {
    @apply w-full flex gap-4 border border-gray-900 border-b-0 flex-wrap items-center border-gray-900 text-sm no-underline px-2 xl:py-3 xl:text-base;
  }

  .row:hover {
    @apply z-50 cursor-pointer bg-gradient-to-b from-blue-100 to-purple-100;
  }

  .expanded.row {
    @apply bg-blue-50;
  }

  .active.row {
    @apply bg-purple-50;
  }

  .failure,
  .failure:hover {
    @apply bg-red-50;
  }

  .failure .event-name {
    @apply text-red-700;
  }

  .canceled,
  .canceled:hover {
    @apply bg-yellow-50;
  }

  .canceled .event-name {
    @apply text-yellow-700;
  }

  .terminated,
  .terminated:hover {
    @apply bg-pink-50;
  }

  .terminated .event-name {
    @apply text-pink-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }

  .expanded-cell {
    @apply flex w-full flex-wrap text-sm no-underline xl:text-base;
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

  .typedError .cell {
    @apply first-of-type:rounded-tl-lg  last-of-type:rounded-tr-lg;
  }
</style>
