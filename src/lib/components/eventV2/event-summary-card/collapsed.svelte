<script lang="ts">
  import { eventShowElapsed } from '$lib/stores/event-view';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { isEventGroup } from '$lib/models/event-groups';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Details from './details.svelte';
  import {
    eventGroupDisplayName,
    getAttributePayloads,
  } from '../event-detail-keys';
  import EventClassification from './event-classification.svelte';
  import EnhancedStackTrace from './enhanced-stack-trace.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;
  export let expanded = false;
  export let showClassification = false;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: payloadAttributes = getAttributePayloads(event.attributes);
</script>

<div
  class="flex w-full cursor-pointer flex-col justify-between gap-2 md:flex-row"
>
  <div class="flex items-center gap-4">
    <p>{initialEvent.id}</p>
    <div class="flex items-center gap-2">
      <p
        class="event-name truncate text-sm font-semibold md:text-base xl:text-lg"
      >
        {eventGroupDisplayName(event)}
      </p>
      {#if showClassification}
        <EventClassification classification={lastEvent.classification} />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-end gap-2 md:justify-start">
    {#if payloadAttributes.length}
      <Icon name="json" class="rounded bg-gray-900 px-1 text-white" />
    {/if}
    <Details {event} primary />
    <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
  </div>
</div>
{#if event.category === 'timer'}
  <EnhancedStackTrace />
{/if}
