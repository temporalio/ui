<script lang="ts">
  import type { IterableEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailsRowExpanded from '../event/event-details-row-expanded.svelte';

  export let event: IterableEvent;

  $: attributes = formatAttributes(event);
  $: eventDetails = Object.entries(attributes);
</script>

<div class="flex flex-col gap-2">
  {#each eventDetails as [key, value] (key)}
    <EventDetailsRowExpanded
      {key}
      {value}
      {attributes}
      class="w-full text-white"
    />
  {/each}
</div>
