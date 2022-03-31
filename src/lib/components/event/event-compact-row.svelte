<script lang="ts">
  import EventClassification from './event-classification.svelte';
  import EventSingleDetail from './event-single-detail.svelte';
  import EventGroupDetails from './event-group-details.svelte';
  import EventDetails from './event-details.svelte';

  export let eventGroup: CompactEventGroups;

  $: collapsed = true;
  $: event = eventGroup.initialEvent;

  const onRowClick = () => {
    if (collapsed) {
      collapsed = !collapsed;
    }
  };

  const onClassificationClick = () => {
    collapsed = !collapsed;
  };

  const onEventClick = (id: string) => {
    event = eventGroup.events.get(id);
  };
</script>

<article class="row" on:click|stopPropagation={onRowClick}>
  <div class="cell">
    <div>
      <span
        class={collapsed ? 'link collapsed' : 'link expanded'}
        on:click|stopPropagation={onClassificationClick}
        ><EventClassification event={eventGroup} /></span
      >
      {#if !collapsed}
        <div class="p-8">
          <EventGroupDetails
            {eventGroup}
            eventId={event.id}
            onClick={onEventClick}
          />
        </div>
      {/if}
    </div>
  </div>
  <div class="cell">
    {#if collapsed}
      <EventSingleDetail {eventGroup} />
    {:else}
      <EventDetails {event} />
    {/if}
  </div>
</article>

<style lang="postcss">
  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }
  .row:hover {
    @apply bg-gray-50 cursor-pointer;
  }
  .link {
    @apply text-gray-900 mx-4;
  }
  .row:hover :global(.collapsed) {
    @apply text-blue-700 border-b-2 border-blue-700;
  }
  .row:hover :global(.expanded:hover) {
    @apply text-blue-700 border-b-2 border-blue-700;
  }
</style>
