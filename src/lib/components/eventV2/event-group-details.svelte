<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailBadge from './event-detail-badge.svelte';

  export let event: WorkflowEvent;
  export let compact = true;
  export let primary = false;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);

  const denyKeys = [
    'activityId',
    'timerId',
    'eventTime',
    'binaryChecksum',
    'scheduledEventId',
    'startedEventId',
    'workflowTaskCompletedEventId',
  ];

  $: filteredDetails = eventDetails.filter(([key, _value]) => {
    return !denyKeys.includes(key);
  });

  $: events = primary ? filteredDetails.slice(0, 1) : filteredDetails;
</script>

<div class="flex flex-col gap-2">
  <div class="grid grid-cols-3 gap-4" class:col-1={primary}>
    {#each events as [key, value] (key)}
      <EventDetailBadge {key} {value} {attributes} {primary} />
    {/each}
  </div>
</div>

<style lang="postcss">
  .col-1 {
    @apply grid-cols-1;
  }
</style>
