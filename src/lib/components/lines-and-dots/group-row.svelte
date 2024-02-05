<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventRowDetails from './event-row-details.svelte';
  import { gap } from './history-graph.svelte';

  export let group: EventGroup;
  export let onClick: () => void;
  export let active = false;

  // let duration = formatDistanceAbbreviated({
  //   start: group.initialEvent.eventTime,
  //   end: group.lastEvent.eventTime,
  //   includeMilliseconds: true,
  // });
  // let elapsedTime = formatDistanceAbbreviated({
  //   start: initialEvent.eventTime,
  //   end: group.initialEvent.eventTime,
  //   includeMilliseconds: true,
  // });
</script>

<div
  class="flex h-10 cursor-pointer select-none max-h-[{gap}px] h-[{gap}px] w-full min-w-max grow items-center px-4 py-0 text-white hover:bg-indigo-400"
  in:fade={{ duration: 500 }}
  on:click={onClick}
  on:focus={onClick}
  on:keydown={onClick}
  class:active
>
  <div class="flex grow items-center justify-between gap-2">
    <div class="flex items-center gap-6">
      <div class="flex grow gap-0">
        <p>{group.id}</p>
      </div>
      <p>{group.name}</p>
    </div>
    <EventRowDetails
      {...getSingleAttributeForEvent(group.initialEvent)}
      attributes={formatAttributes(group.initialEvent)}
      inline
    />
  </div>
</div>

<style lang="postcss">
  .active {
    @apply bg-blurple;
  }
</style>
