<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Details from './details.svelte';
  import { eventGroupDisplayName } from '../event-detail-keys';
  import EventClassification from './event-classification.svelte';
  import type { IterableEvent } from '$lib/types/events';

  export let event: IterableEvent;
  export let expanded = false;
  export let pending = false;
  export let showClassification = false;
  export let hasGroupEvents = false;
  export let inEventGroup = false;
  export let inSubGroup = false;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
</script>

<div class="flex cursor-pointer flex-col justify-between gap-2 md:flex-row">
  <div class="flex items-center justify-between gap-4">
    <p>{initialEvent.id}</p>
    <div class="flex items-center gap-2">
      {#if pending}
        <div class="flex gap-2 items-center md:text-sm xl:text-md">
          Activity
          <div
            class="rounded-xl border-2 border-gray-900 bg-green-50 py-1 px-2"
          >
            In progress
          </div>
          <p class="event-name truncate text-sm font-semibold">
            {event.activityType}
          </p>
        </div>
      {:else if !inEventGroup}
        <p
          class="event-name truncate text-sm font-semibold md:text-sm xl:text-md"
        >
          {eventGroupDisplayName(event, inSubGroup)}
        </p>
      {/if}

      {#if showClassification}
        <EventClassification classification={lastEvent.classification} />
      {/if}
      {#if hasGroupEvents}
        <Icon name="relationship" class="scale-75" />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-end gap-2 md:justify-start">
    <Details {event} {expanded} primary />
  </div>
</div>
