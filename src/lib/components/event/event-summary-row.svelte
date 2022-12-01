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
  export let groups: EventGroups;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;

  let selectedId = event.id;

  let eventGroup = isEventGroup(event)
    ? event
    : getGroupForEvent(event, groups);

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

  const failure = eventOrGroupIsFailureOrTimedOut(compact ? eventGroup : event);
  const canceled = eventOrGroupIsCanceled(compact ? eventGroup : event);
  const terminated = eventOrGroupIsTerminated(compact ? eventGroup : event);

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
  <td class="id-cell text-left">
    <a class="mx-1 text-sm text-gray-500 md:text-base" href="#{event.id}"
      >{event.id}</a
    >
  </td>
  <td class="cell flex w-1/4 text-left">
    <a
      class="mx-1 text-sm text-gray-500 md:text-base xl:hidden"
      href="#{event.id}">{event.id}</a
    >
    <p class="m-0 text-sm md:text-base">
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
  <td class="cell w-10 text-right text-sm font-normal xl:text-left">
    <p tabindex="0" class="event-name text-sm font-semibold md:text-base">
      {#if compact && failure}
        <Icon class="inline align-top text-red-700" name="clock" />
      {/if}
      {#if compact && canceled}
        <Icon class="inline align-top text-yellow-700" name="clock" />
      {/if}
      {#if compact && terminated}
        <Icon class="inline align-top text-pink-700" name="clock" />
      {/if}
      {getTruncatedWord(
        isLocalActivityMarkerEvent(event) ? 'LocalActivity' : event.name,
        truncateWidth - 30,
      )}
      {#if compact}
        <Icon
          class="ml-1.5 inline align-top"
          name={expanded ? 'chevron-up' : 'chevron-down'}
        />
      {/if}
    </p>
  </td>
  <td class="cell links">
    {#if !expanded && !compact}
      <EventDetailsRow
        {...getSingleAttributeForEvent(currentEvent)}
        {attributes}
        inline
      />
    {/if}
  </td>
  <td class="cell text-right">
    {#if !compact}
      <Icon class="inline" name={expanded ? 'chevron-up' : 'chevron-down'} />
    {/if}
  </td>
</tr>
{#if expanded}
  <tr class="expanded-row" class:typedError>
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
    @apply flex flex-wrap items-center border-b-2 border-gray-700 text-sm no-underline last-of-type:border-b-0 xl:table-row xl:py-3 xl:text-base;
  }

  .row:hover {
    @apply z-50 cursor-pointer bg-gradient-to-b from-blue-100 to-purple-100;
  }

  .expanded.row {
    @apply bg-blue-50;
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

  .cell {
    @apply border-gray-700 px-3 pt-1 pb-0 leading-4 xl:table-cell xl:border-b-2;
    flex: 40%;
  }

  .id-cell {
    @apply hidden border-gray-700 py-1 px-3 leading-4 xl:table-cell xl:border-b-2;
  }

  .row:last-of-type .cell,
  .row:last-of-type .id-cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }

  .expanded-row {
    @apply block xl:table-row xl:border-b-2 xl:border-gray-700;
  }

  .expanded-cell {
    @apply flex w-full flex-wrap border-b-2 border-gray-700 text-sm no-underline xl:table-cell xl:text-base;
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
