<script lang="ts">
  import { page } from '$app/stores';

  import { getGroupForEvent, isEventGroup } from '$lib/models/group-events';

  import { formatDate } from '$lib/utilities/format-date';

  import EventDetails from './event-details.svelte';
  import EventGroupDetails from './event-group-details.svelte';

  export let event: IterableEvent;
  export let groups: CompactEventGroups;
  export let expandAll = false;
  export let compact = false;

  let selectedId = event.id;

  let eventGroup = isEventGroup(event)
    ? event
    : getGroupForEvent(event, groups);

  $: expanded = expandAll;
  $: currentEvent = compact ? eventGroup.events.get(selectedId) : event;

  const onLinkClick = () => {
    if (!expandAll) {
      expanded = !expanded;
    }
  };
</script>

<article class="row" id={event.id}>
  <div class="cell">
    <a
      class="text-gray-500 text-normal mx-1 text-lg md:text-base"
      href="#{event.id}">{event.id}</a
    >
    <span
      class="md:mx-2 text-lg md:text-base font-semibold"
      class:link={!expandAll}
      on:click|stopPropagation={onLinkClick}>{event.name}</span
    >
    {#if expanded && compact}
      <EventGroupDetails {eventGroup} bind:selectedId />
    {/if}
  </div>
  <div class="cell links font-medium md:font-normal">
    {formatDate(event?.eventTime)}
  </div>

  <div class="cell links">
    <EventDetails event={currentEvent} {expanded} summaryEvent={event} />
  </div>
</article>

<style lang="postcss">
  .cell {
    @apply md:table-cell md:border-b-2 text-left py-1 px-3 pt-2;
  }

  .row {
    @apply no-underline py-3 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
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
