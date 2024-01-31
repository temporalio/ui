<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetails from './event-details.svelte';
  import { gap } from './event-graph.svelte';

  export let event: WorkflowEvent;
  export let onHover: (workflow: WorkflowEvent) => void;
  export let onHoverLeave: () => void;
  export let activeGroup: undefined | EventGroup;

  $: active = activeGroup?.eventIds?.has(event.id);
</script>

<div
  class="flex h-10 max-h-[{gap}px] h-[{gap}px] w-full grow items-center gap-2 px-4 py-0 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
  on:mouseover={() => onHover(event)}
  on:focus={() => onHover(event)}
  on:mouseleave={onHoverLeave}
  class:active
>
  <div class="flex grow items-center justify-between">
    <div class="flex items-center gap-6">
      <div class="flex grow gap-0">
        <p>{event.id}</p>
      </div>
      <p>{capitalize(event.name)}</p>
    </div>
    <EventDetails
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
