<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import Details from './details.svelte';
  import EventGroupSummaryCard from './card.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
</script>

{#if isEventGroup(event) && hasGroupEvents}
  <div class="secondary">
    {#each event.eventList as groupEvent, index}
      <EventGroupSummaryCard
        event={groupEvent}
        {events}
        {firstEvent}
        expandAll={false}
        last={index === event.eventList.length - 1}
      />
    {/each}
  </div>
{/if}
{#if !hasGroupEvents}
  <Details event={initialEvent} expanded />
{/if}

<style lang="postcss">
  .secondary {
    @apply mt-2 flex flex-col;
  }
</style>
