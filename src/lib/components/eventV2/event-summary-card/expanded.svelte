<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import Details from './details.svelte';
  import { getAttributePayloads } from '../event-detail-keys';
  import EventGroupSummaryCard from '../event-group-summary-card.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: payloadAttributes = getAttributePayloads(event.attributes);
</script>

{#if isEventGroup(event) && hasGroupEvents}
  <div class="secondary">
    {#each event.eventList as groupEvent, index}
      <EventGroupSummaryCard
        event={groupEvent}
        {events}
        {firstEvent}
        last={index === event.eventList.length - 1}
      />
    {/each}
  </div>
{/if}
{#if !hasGroupEvents}
  <Details event={initialEvent} expanded />
{/if}

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 py-2 pl-8 pr-2 text-sm no-underline xl:text-base;
  }

  .code-with-stack-trace {
    @apply flex flex-col gap-2 lg:flex-row;
  }

  .secondary {
    @apply mt-2 flex flex-col;
  }

  .failure p {
    @apply text-red-700;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .terminated p {
    @apply text-pink-700;
  }

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }
</style>
