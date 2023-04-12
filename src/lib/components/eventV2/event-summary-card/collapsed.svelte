<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Details from './details.svelte';
  import { eventGroupDisplayName } from '../event-detail-keys';
  import EventClassification from './event-classification.svelte';

  export let event: IterableEvent;
  export let expanded = false;
  export let pending = false;
  export let showClassification = false;
  export let hasGroupEvents = false;
  export let inSubGroup = false;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
</script>

<div class="flex cursor-pointer flex-col justify-between gap-2 md:flex-row">
  <div class="flex items-center justify-between gap-4">
    <p>{initialEvent.id}</p>
    <div class="flex items-center gap-2">
      <p
        class="event-name truncate text-sm font-semibold md:text-base xl:text-lg"
      >
        {pending ? 'Pending' : eventGroupDisplayName(event, inSubGroup)}
      </p>
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
