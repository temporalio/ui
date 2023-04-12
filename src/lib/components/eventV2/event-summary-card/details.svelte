<script lang="ts">
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { fade, fly } from 'svelte/transition';

  import DetailBadge from './detail-badge.svelte';
  import { getPrimaryIterableEventDetails } from '../event-detail-keys';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let event: IterableEvent;
  export let compact = true;
  export let primary = false;
  export let expanded = false;

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

  $: primaryEvents = primary && event && getPrimaryIterableEventDetails(event);
  $: secondaryEvents = eventDetails.filter(([key, _value]) => {
    return !denyKeys.includes(key);
  });
</script>

{#if primaryEvents.length}
  <div class="flex flex-row gap-2">
    {#each primaryEvents as { key, value, badge } (key)}
      <DetailBadge {key} {value} {badge} {attributes} {primary} />
    {/each}
  </div>
{:else if secondaryEvents.length}
  <div
    class="grid grid-cols-2 gap-1 bg-white border border-gray-900 p-4"
    class:secondary={!primary}
    in:fly={{ x: -100, duration: 200 }}
  >
    {#each secondaryEvents as [key, value] (key)}
      <DetailBadge {key} {value} {attributes} {primary} />
    {/each}
  </div>
{/if}
{#if primary && secondaryEvents.length}
  <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
{/if}

<style lang="postcss">
  .secondary {
    @apply my-1;
  }
</style>
