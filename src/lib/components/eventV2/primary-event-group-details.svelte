<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailBadge from './event-detail-badge.svelte';

  export let event: WorkflowEvent;
  export let compact = true;
  export let primary = false;

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

  $: events = primary ? filteredDetails.slice(0, 1) : filteredDetails;
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each events as [key, value] (key)}
    <EventDetailBadge {key} {value} {attributes} />
  {/each}
</div>
