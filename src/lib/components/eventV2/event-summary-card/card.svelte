<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import EventGroupSummaryCard from '../event-group-summary-card.svelte';
  import LineDot from './line-dot.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  export let thick = false;
  export let initial = false;
  export let last = false;
  export let final = false;
  export let pending = false;

  let expanded = false;

  const onLinkClick = () => {
    expanded = !expanded;
  };

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
</script>

<div class="flex gap-2">
  <LineDot {event} removeTail={last || final} removeHead={initial} />
  <div class="h-full w-full pt-2" class:pt-0={initial}>
    <div
      class="card {$$props.class}"
      class:shadow={thick}
      class:unround-top={initial}
      class:unround-bottom={final}
      class:pending
      class:expanded={thick && expanded}
    >
      <div
        class="row"
        id={initialEvent.id}
        class:expanded={expanded && hasGroupEvents}
        aria-expanded={expanded}
        data-testid="event-summary-card"
        on:click|stopPropagation={onLinkClick}
        on:keydown={onLinkClick}
      >
        <slot {expanded} />
      </div>
    </div>
    {#if isEventGroup(event) && event?.subGroupList?.length}
      <div class="flex w-full flex-col pl-12">
        {#each event.subGroupList as group, index}
          <EventGroupSummaryCard
            event={group}
            {events}
            {firstEvent}
            last={index === event.subGroupList.length - 1}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .card {
    @apply relative grow select-none rounded-xl border-2 border-gray-900 bg-white p-0;
  }

  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 px-4 py-2 text-sm no-underline xl:text-base;
  }

  .pending {
    @apply border-dashed bg-red-100;
  }

  .expanded {
    @apply bg-gray-200;
  }

  .unround-top {
    @apply rounded-t-none pt-0;
  }

  .unround-bottom {
    @apply rounded-b-none;
  }

  .shadow {
    box-shadow: 0 6px 1px -1px #18181b;
  }
</style>
