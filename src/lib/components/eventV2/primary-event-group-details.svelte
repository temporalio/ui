<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailRowItem from './event-detail-row-item.svelte';

  export let event: WorkflowEvent;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);
  const denyKeys = [
    'eventTime',
    'binaryChecksum',
    'scheduledEventId',
    'startedEventId',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return !denyKeys.includes(key);
  });
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each filteredDetails.slice(0, 2) as [key, value] (key)}
    <EventDetailRowItem {key} {value} {attributes} />
  {/each}
</div>
