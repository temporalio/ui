<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

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

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return !denyKeys.includes(key);
  });

  $: events = primary ? filteredDetails.slice(0, 1) : filteredDetails;

  let showJSON = false;
</script>

<div class="flex flex-col gap-2">
  {#if showJSON}
    <div class="h-80">
      <CodeBlock content={stringifyWithBigInt(event)} />
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-4" class:col-1={primary}>
      {#each events as [key, value] (key)}
        <EventDetailBadge {key} {value} {attributes} />
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  .col-1 {
    @apply grid-cols-1;
  }
</style>
