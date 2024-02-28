<script lang="ts">
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailsRowExpanded from '../event/event-details-row-expanded.svelte';

  export let event: IterableEvent;

  $: attributes = formatAttributes(event);
  $: eventDetails = Object.entries(attributes);
  $: formattedEventTime = formatDate(event?.eventTime, $timeFormat, {
    relative: $relativeTime,
  });
</script>

<div class="grid grid-cols-1 gap-2">
  <EventDetailsRowExpanded
    key="eventTime"
    value={formattedEventTime}
    {attributes}
    class="w-full text-white"
  />
  {#each eventDetails as [key, value] (key)}
    <EventDetailsRowExpanded
      {key}
      {value}
      {attributes}
      class="w-full text-white"
    />
  {/each}
</div>
