<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import { eventSortOrder, eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowEventsColumnWidth,
    workflowEventsResponsiveColumnWidth,
  } from '$lib/stores/column-width';

  import { getGroupForEvent, isEventGroup } from '$lib/models/event-groups';
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';
  import { getTruncatedWord } from '$lib/utilities/get-truncated-word';

  import EventDetailsRow from './event-details-row.svelte';
  import EventDetailsFull from './event-details-full.svelte';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;

  let selectedId = event.id;

  let eventGroup = !compact ? event : getGroupForEvent(event, visibleItems);

  $: expanded = expandAll;

  $: currentEvent = compact ? eventGroup.events.get(selectedId) : event;
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

  const failure = eventOrGroupIsFailureOrTimedOut(
    compact && eventGroup ? eventGroup : event,
  );
  const canceled = eventOrGroupIsCanceled(
    compact && eventGroup ? eventGroup : event,
  );
  const terminated = eventOrGroupIsTerminated(
    compact && eventGroup ? eventGroup : event,
  );

  let truncateWidth: number;
  workflowEventsColumnWidth.subscribe((value) => {
    if (value !== 0) truncateWidth = value;
  });
  workflowEventsResponsiveColumnWidth.subscribe((value) => {
    if (value !== 0) truncateWidth = value;
  });
</script>

<tr
  class="row"
  id={event.id}
  class:expanded={expanded && !expandAll}
  class:failure
  class:canceled
  class:terminated
  class:typedError
  data-cy="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td />
  <td class="table-cell w-24 text-left">
    <a class="text-sm text-gray-500 md:text-base" href="#{event.id}"
      >{event.id}</a
    >
  </td>
  <td class="flex table-cell text-left">
    <p class="text-sm md:text-base">
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
  </td>
  <td class="table-cell text-right text-sm font-normal xl:text-left">
    <p tabindex="0" class="event-name text-sm font-semibold md:text-base">
      {#if compact && failure}
        <Icon class="inline text-red-700" name="clock" />
      {/if}
      {#if compact && canceled}
        <Icon class="inline text-yellow-700" name="clock" />
      {/if}
      {#if compact && terminated}
        <Icon class="inline text-pink-700" name="clock" />
      {/if}
      {getTruncatedWord(
        isLocalActivityMarkerEvent(event) ? 'LocalActivity' : event.name,
        truncateWidth - 30,
      )}
    </p>
  </td>
  <td class="links table-cell items-center">
    <div class="flex justify-between">
      <div class="invisible w-full md:visible">
        {#if !expanded}
          <EventDetailsRow
            {...getSingleAttributeForEvent(currentEvent)}
            {attributes}
            inline
          />
        {/if}
      </div>
      <div class="w-4">
        <Icon class="inline" name={expanded ? 'chevron-up' : 'chevron-down'} />
      </div>
    </div>
  </td>
  <td />
</tr>
{#if expanded}
  <tr class="table-row" class:typedError>
    <td />
    <td class="expanded-cell" colspan="5">
      <EventDetailsFull
        event={currentEvent}
        {compact}
        {eventGroup}
        bind:selectedId
      />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex table-row flex-wrap items-center border-gray-900 text-sm no-underline xl:py-3 xl:text-base;
  }

  .row:hover {
    @apply z-50 cursor-pointer border-2 border-gray-900 bg-gradient-to-b from-blue-100 to-purple-100;
  }

  .expanded.row {
    @apply border-b-0;
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

  .expanded-cell {
    @apply flex table-cell w-full flex-wrap text-sm no-underline xl:text-base;
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

  .typedError .cell,
  .typedError .id-cell {
    @apply first-of-type:rounded-tl-lg  last-of-type:rounded-tr-lg;
  }
</style>
