<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import LineDot from './line-dot.svelte';
  import AttributesCodeBlock from './attributes-code-block.svelte';
  import Expanded from './expanded.svelte';
  import Collapsed from './collapsed.svelte';
  import PendingActivityDetails from '../pending-activity-details.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  export let initial = false;
  export let last = false;
  export let final = false;
  export let pending = false;
  export let expandAll = false;
  export let inSubGroup = false;

  $: expanded = expandAll || false;
  $: hasSubGroup = isEventGroup(event) && event?.subGroupList?.length;

  const onLinkClick = () => {
    expanded = !expanded;
  };

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: showClassification =
    isEventGroup(event) && hasGroupEvents && event.lastEvent?.classification;
</script>

<div class="flex">
  <LineDot
    {event}
    {firstEvent}
    {events}
    removeTail={last || final}
    removeHead={initial}
    {pending}
  />
  <div class="w-full overflow-hidden">
    <div class="flex my-[2px]">
      <div
        class="card {$$props.class}"
        class:unround-top={initial}
        class:unround-bottom={final}
        class:pending
        class:expanded={hasSubGroup && expanded}
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
          <Collapsed
            {event}
            {pending}
            expanded={expandAll || expanded}
            {showClassification}
            {hasGroupEvents}
            {inSubGroup}
          />
        </div>
      </div>
      <AttributesCodeBlock event={initialEvent} />
    </div>
    {#if expandAll || expanded}
      {#if pending}
        <PendingActivityDetails {event} />
      {:else}
        <Expanded {event} {events} {firstEvent} />
      {/if}
    {/if}
  </div>
</div>
{#if isEventGroup(event) && event?.subGroupList?.length}
  <div class="flex w-full flex-col pl-24">
    {#each event.subGroupList as group, index}
      <svelte:self
        event={group}
        {events}
        {firstEvent}
        {expandAll}
        inSubGroup
        last={index === event.subGroupList.length - 1}
      />
    {/each}
  </div>
{/if}

<style lang="postcss">
  .card {
    @apply relative w-1/2 flex items-center rounded-tl-xl rounded-bl-xl select-none bg-white border border-gray-900;
  }

  .row {
    @apply w-full px-4 py-2 text-sm no-underline xl:text-base;
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
