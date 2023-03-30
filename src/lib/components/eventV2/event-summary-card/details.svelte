<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import DetailBadge from './detail-badge.svelte';
  import { getPrimaryIterableEventDetails } from '../event-detail-keys';

  export let event: IterableEvent;
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

  $: primaryEvents = primary && event && getPrimaryIterableEventDetails(event);
  $: secondaryEvents = !primary && filteredDetails;
</script>

{#if primaryEvents.length}
  <div class="flex flex-row gap-2">
    {#each primaryEvents as { key, value, badge } (key)}
      <DetailBadge {key} {value} {badge} {attributes} {primary} />
    {/each}
  </div>
{:else if secondaryEvents.length}
  <div class="flex flex-col gap-1" class:secondary={!primary}>
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {#each secondaryEvents as [key, value] (key)}
        <DetailBadge {key} {value} {attributes} {primary} />
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
  .secondary {
    @apply my-1;
  }
</style>
