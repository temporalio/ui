<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

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

  $: primaryEvent = primary && getSingleAttributeForEvent(event);
  $: secondaryEvents = !primary && filteredDetails;
</script>

{#if primaryEvent}
  <div class="flex flex-col gap-2">
    <EventDetailBadge
      key={primaryEvent.key}
      value={primaryEvent.value}
      {attributes}
      {primary}
    />
  </div>
{:else if secondaryEvents.length}
  <div class="flex flex-col gap-2" class:secondary={!primary}>
    <div class="grid grid-cols-2 gap-4" class:col-1={primary}>
      {#each secondaryEvents as [key, value] (key)}
        <EventDetailBadge {key} {value} {attributes} {primary} />
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
  .col-1 {
    @apply grid-cols-1;
  }

  .secondary {
    @apply p-4;
  }
</style>
