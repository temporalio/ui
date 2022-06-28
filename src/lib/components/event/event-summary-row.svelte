<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

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
  import {
    formatDate,
    formatDistanceAbbreviated,
  } from '$lib/utilities/format-date';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';
  import { getTruncatedWord } from '$lib/utilities/get-truncated-word';

  import EventDetailsRow from './event-details-row.svelte';
  import EventDetailsFull from './event-details-full.svelte';

  export let event: IterableEvent;
  export let groups: EventGroups;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent;
  export let compact = false;
  export let expandAll = false;

  let selectedId = event.id;

  let eventGroup = isEventGroup(event)
    ? event
    : getGroupForEvent(event, groups);

  $: expanded = expandAll;

  $: currentEvent = compact ? eventGroup.events.get(selectedId) : event;
  $: descending = $eventSortOrder === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';

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
        <Icon class="inline text-red-700" name="clock" />
      {/if}
      {#if compact && canceled}
        <Icon class="inline text-yellow-700" name="clock" />
      {/if}
      {#if compact && terminated}
        <Icon class="inline text-pink-700" name="clock" />
      {/if}
      {getTruncatedWord(event.name, truncateWidth - 30)}
    </p>
  </td>
  <td class="cell links">
    {#if !expanded}
      <EventDetailsRow {...getSingleAttributeForEvent(currentEvent)} inline />
    {/if}
  </td>
  <td class="cell text-right">
    <Icon class="inline" name={expanded ? 'caretUp' : 'caretDown'} />
  </td>
</tr>
{#if expanded}
  <tr class="expanded-row">
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
    @apply cursor-pointer bg-gray-50;
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

  .cell {
    @apply border-gray-700 px-3 pt-1 pb-0 leading-4 xl:table-cell xl:border-b-2;
    flex: 40%;
  }

  .id-cell {
    @apply hidden border-gray-700 py-1 px-3 leading-4 xl:table-cell xl:border-b-2;
  }

  .expanded .cell,
  .expanded .id-cell {
    @apply border-b-0;
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
</style>
