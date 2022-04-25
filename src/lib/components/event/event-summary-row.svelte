<script lang="ts">
  import { getGroupForEvent, isEventGroup } from '$lib/models/group-events';
  import Icon from 'svelte-fa';

  import {
    formatDate,
    formatDistanceAbbreviated,
  } from '$lib/utilities/format-date';
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-filters';
  import { timeFormat } from '$lib/stores/time-format';

  import EventDetails from './event-details.svelte';
  import EventGroupDetails from './event-group-details.svelte';
  import { isSubrowActivity } from '$lib/utilities/is-subrow-activity';
  import { eventViewType } from '$lib/stores/event-view-type';
  import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

  export let event: IterableEvent;
  export let groups: CompactEventGroups;
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
  $: reversed = $eventFilterSort === 'reverse';
  $: showElapsed = $eventShowElapsed === 'true';

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: compact
          ? (previousItem as CompactEventGroup)?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: compact ? currentEvent?.eventTime : event?.eventTime,
      });
      timeDiffChange = timeDiff ? `(${reversed ? '-' : '+'}${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
  };

  $: subRow = isSubrowActivity(event) && $eventViewType === 'feed';
</script>

<article class="row" id={event.id} class:expanded={expanded && !expandAll}>
  <div class="id-cell text-left">
    <a
      class="text-gray-500 mx-1 text-sm md:text-base"
      class:subRow
      href="#{event.id}">{event.id}</a
    >
  </div>
  <div class="cell flex text-left">
    <a
      class="text-gray-500 mx-1 text-sm md:text-base xl:hidden"
      class:subRow
      href="#{event.id}">{event.id}</a
    >
    <p
      class="md:mx-2 text-sm md:text-base font-semibold link"
      class:subRow
      on:click|stopPropagation={onLinkClick}
    >
      {event.name}
      <Icon class="inline" icon={expanded ? faAngleUp : faAngleDown} />
    </p>
    {#if expanded && compact}
      <EventGroupDetails {eventGroup} bind:selectedId />
    {/if}
  </div>
  <div class="cell links text-sm font-normal text-right xl:text-left">
    {#if showElapsed && event.id !== initialItem.id}
      {formatDistanceAbbreviated({
        start: initialItem.eventTime,
        end: currentEvent.eventTime,
      })}
      {timeDiffChange}
    {:else}
      {formatDate(event?.eventTime, $timeFormat)}
    {/if}
  </div>
  <div class="cell links">
    <EventDetails
      event={currentEvent}
      summaryEvent={event}
      {expanded}
      {compact}
    />
  </div>
</article>

<style lang="postcss">
  .cell {
    @apply xl:table-cell xl:border-b-2 border-gray-700 py-1 px-3 leading-4;
    flex: 40%;
  }

  .id-cell {
    @apply hidden xl:table-cell xl:border-b-2 border-gray-700 py-1 px-3 leading-4;
  }

  .row {
    @apply no-underline xl:py-3 text-sm border-b-2 border-gray-700 items-center xl:text-base flex flex-wrap xl:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
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

  .subRow {
    @apply ml-2 md:ml-4 xl:ml-6 text-sm;
  }

  .expanded,
  .expanded:hover {
    @apply bg-blue-50;
  }
</style>
