<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import EventGroupSummaryCard from '../event-group-summary-card.svelte';
  import LineDot from './line-dot.svelte';
  import AttributesCodeBlock from './attributes-code-block.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  export let thick = false;
  export let initial = false;
  export let last = false;
  export let final = false;
  export let pending = false;
  export let expandAll = false;
  export let subGroup = false;

  $: expanded = expandAll || false;
  $: hasSubGroup = isEventGroup(event) && event?.subGroupList?.length;

  const onLinkClick = () => {
    expanded = !expanded;
  };

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
</script>

<div class="flex gap-1">
  <LineDot
    {event}
    {firstEvent}
    {events}
    removeTail={last || final}
    removeHead={initial}
    {pending}
  />
  <div
    class="h-full w-full overflow-hidden flex flex-col"
    class:mb-1={hasSubGroup || initial}
    class:mt-1={!hasSubGroup}
  >
    <div class="h-full w-full">
      <div
        class="card {$$props.class}"
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
        <div class="flex w-full flex-col pb-2">
          {#each event.subGroupList as group, index}
            <EventGroupSummaryCard
              event={group}
              {events}
              {firstEvent}
              {expandAll}
              last={index === event.subGroupList.length - 1}
            />
          {/each}
        </div>
      {/if}
    </div>
    <AttributesCodeBlock event={initialEvent} />
  </div>
</div>

<style lang="postcss">
  .card {
    @apply relative grow select-none bg-white p-0 border-2 border-gray-900;
  }

  .row {
    @apply flex-wrap items-center px-4 py-2 text-sm no-underline xl:text-base;
  }

  .pending {
    @apply border-dashed;
  }

  .unround-top {
    @apply pt-0;
  }

  .shadow {
    box-shadow: 0 6px 1px -1px #18181b;
  }
</style>
