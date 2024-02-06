<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventRowDetails from './event-row-details.svelte';
  import { historyGap } from './history-graph.svelte';

  export let event: WorkflowEvent;

  export let onClick: (workflow: WorkflowEvent | PendingActivity) => void;
  export let active = false;
</script>

<div
  class="flex h-10 cursor-pointer select-none max-h-[{historyGap}px] h-[{historyGap}px] w-full min-w-max grow items-center px-4 py-0 text-white hover:bg-indigo-400"
  in:fade={{ duration: 500 }}
  on:click={() => onClick(event)}
  on:focus={() => onClick(event)}
  on:keydown={() => onClick(event)}
  class:active
>
  <div class="flex grow items-center justify-between gap-2">
    <div class="flex items-center gap-6">
      <div class="flex grow gap-0">
        <p>{event.id}</p>
      </div>
      <p>{spaceBetweenCapitalLetters(event.name)}</p>
    </div>
    <EventRowDetails
      {...getSingleAttributeForEvent(event)}
      attributes={formatAttributes(event)}
      inline
    />
  </div>
</div>

<style lang="postcss">
  .active {
    @apply bg-blurple;
  }
</style>
