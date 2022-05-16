<script lang="ts">
  import Icon from 'svelte-fa';
  import {
    faAngleDown,
    faAngleUp,
    faClock,
  } from '@fortawesome/free-solid-svg-icons';

  import { eventSortOrder, eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';

  import { getGroupForEvent, isEventGroup } from '$lib/models/event-groups';
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceledOrTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import {
    formatDate,
    formatDistanceAbbreviated,
  } from '$lib/utilities/format-date';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

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

  const error = eventOrGroupIsFailureOrTimedOut(compact ? eventGroup : event);
  const warning = eventOrGroupIsCanceledOrTerminated(
    compact ? eventGroup : event,
  );
</script>

<tr
  class="row"
  id={event.id}
  class:expanded={expanded && !expandAll}
  class:error
  class:warning
  data-cy="event-summary-row"
>
  <td class="id-cell text-left">
    <a class="text-gray-500 mx-1 text-sm md:text-base" href="#{event.id}"
      >{event.id}</a
    >
  </td>
  <td class="cell flex text-left">
    <a
      class="text-gray-500 mx-1 text-sm md:text-base xl:hidden"
      href="#{event.id}">{event.id}</a
    >
    <p
      class="md:mx-2 text-sm md:text-base font-semibold link event-name"
      on:click|stopPropagation={onLinkClick}
    >
      {#if compact && error}
        <Icon class="inline text-red-700" icon={faClock} />
      {/if}
      {#if compact && warning}
        <Icon class="inline text-yellow-700" icon={faClock} />
      {/if}
      {event.name}
      <Icon class="inline" icon={expanded ? faAngleUp : faAngleDown} />
    </p>
  </td>
  <td class="cell links text-sm font-normal text-right xl:text-left">
    {#if showElapsed && event.id !== initialItem.id}
      {formatDistanceAbbreviated({
        start: initialItem.eventTime,
        end: currentEvent.eventTime,
      })}
      {timeDiffChange}
    {:else}
      {formatDate(event?.eventTime, $timeFormat)}
    {/if}
  </td>
  <td class="cell links">
    {#if !expanded}
      <EventDetailsRow {...getSingleAttributeForEvent(currentEvent)} inline />
    {/if}
  </td>
</tr>
{#if expanded}
  <tr class="expanded-row">
    <td class="expanded-cell" colspan="4">
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
    @apply no-underline xl:py-3 text-sm border-b-2 border-gray-700 items-center xl:text-base flex flex-wrap xl:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .expanded.row {
    @apply border-b-0;
  }
  .error,
  .error:hover {
    @apply bg-red-50;
  }

  .error .event-name {
    @apply text-red-700;
  }

  .warning,
  .warning:hover {
    @apply bg-yellow-50;
  }

  .warning .event-name {
    @apply text-yellow-700;
  }

  .cell {
    @apply xl:table-cell xl:border-b-2 border-gray-700 pt-1 pb-0 px-3 leading-4;
    flex: 40%;
  }

  .id-cell {
    @apply hidden xl:table-cell xl:border-b-2 border-gray-700 py-1 px-3 leading-4;
  }

  .expanded .cell,
  .expanded .id-cell {
    @apply border-b-0;
  }

  .link {
    @apply text-gray-900 cursor-pointer;
  }

  .row:hover .link {
    @apply text-blue-700 underline decoration-blue-700;
  }

  .row:last-of-type .cell,
  .row:last-of-type .id-cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }

  .expanded-row {
    @apply block xl:table-row xl:border-b-2 xl:border-gray-700;
  }

  .expanded-cell {
    @apply w-full border-gray-700 border-b-2 no-underline text-sm xl:text-base flex flex-wrap xl:table-cell;
  }
</style>
