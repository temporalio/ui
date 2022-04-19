<script lang="ts">
  import { getGroupForEvent, isEventGroup } from '$lib/models/group-events';

  import {
    formatDate,
    formatDistanceAbbreviated,
  } from '$lib/utilities/format-date';
  import {
    eventFilterSort,
    eventTimeFormat,
    eventShowElapsed,
  } from '$lib/stores/event-filters';

  import EventDetails from './event-details.svelte';
  import EventGroupDetails from './event-group-details.svelte';

  export let event: IterableEvent;
  export let groups: CompactEventGroups;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent;
  export let expandAll = false;
  export let compact = false;

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
    if (!expandAll) {
      expanded = !expanded;
    }
  };
</script>

<article class="row mb-4" id={event.id}>
  <div class="cell text-left">
    <a class="text-gray-500 mx-1 text-sm md:text-base" href="#{event.id}"
      >{event.id}</a
    >
    <span
      class="md:mx-2 text-sm md:text-base font-semibold"
      class:link={!expandAll}
      on:click|stopPropagation={onLinkClick}>{event.name}</span
    >
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
      {formatDate(event?.eventTime, $eventTimeFormat)}
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
    @apply xl:table-cell xl:border-b-2 py-1 px-3 leading-4;
    flex: 40%;
  }

  .row {
    @apply no-underline py-3 text-sm border-b-2 items-center xl:text-base flex flex-wrap xl:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .link {
    @apply text-gray-900 cursor-pointer;
  }

  .row:hover .link {
    @apply text-blue-700 border-b-2 border-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
