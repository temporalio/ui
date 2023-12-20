<script lang="ts">
  import { fade } from 'svelte/transition';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getColor, getIcon } from '$lib/utilities/get-row-display';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetails from './event-details.svelte';

  export let event: WorkflowEvent;
  export let onHover: (workflow: WorkflowEvent) => void;
  export let onHoverLeave: () => void;
  export let activeGroup: undefined | EventGroup;

  $: active = activeGroup?.eventIds?.has(event.id);
</script>

<div
  class="flex h-10 items-center gap-2 px-4 py-1 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
  on:mouseover={() => onHover(event)}
  on:focus={() => onHover(event)}
  on:mouseleave={onHoverLeave}
  class:active
>
  <div class="flex justify-between gap-2">
    <div class="flex items-center">
      <div class="-mr-2 h-4 w-4 rounded-full border-2 {getColor(event)}" />
      <div class="flex h-full w-auto items-center gap-0">
        <div class="h-full w-8 {getColor(event)} opacity-20" />
        <div class="h-full w-[2px] {getColor(event)}" />
      </div>
    </div>
    <Icon name={getIcon(event)} class="scale-85 text-white" />
  </div>
  <div class="flex grow items-center justify-between">
    {event.name}
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
