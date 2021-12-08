<script lang="ts">
  import type { HistoryEvent } from '$types';
  import { getAttributesFromEvent } from '$lib/utilities/get-attributes-from-event';
  import { getEventClassification } from '$lib/utilities/get-event-classification';
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/components/code-block.svelte';

  export let event: HistoryEvent;

  const summaryEvent = getAttributesFromEvent(event);
</script>

<article class="flex flex-row items-start event-box border-2 p-4 rounded-lg">
  <h2 class="w-1/3 flex-1 {event.eventType}">
    <span class="label {getEventClassification(event)}"
      >{format(String(event.eventType))}</span
    >
  </h2>
  <div class="flex flex-row items-center event gap-4 w-full flex-3">
    {#each Object.entries(summaryEvent.attributes) as [attribute, value]}
      {#if typeof value === 'object'}
        <div class="flex flex-row gap-2 flex-nowrap">
          <h4>{format(attribute)}</h4>
          <CodeBlock content={value} inline={true} />
        </div>
      {:else if value}
        <div class="flex gap-2 flex-nowrap">
          <h4>{format(attribute)}</h4>
          <p class="w-full label">{value}</p>
        </div>
      {/if}
    {/each}
  </div>
</article>

<style lang="postcss">
  h4 {
    @apply whitespace-nowrap;
  }

  .event-box {
    margin: 1rem 0;
  }

  .label {
    @apply bg-gray-300 px-2 rounded-sm;
  }

  .Scheduled {
    @apply text-gray-700 bg-gray-100;
  }

  .Open,
  .New {
    @apply text-indigo-700 bg-indigo-100;
  }

  .Started,
  .Initiated {
    @apply text-blue-700 bg-blue-100;
  }

  .Running,
  .Completed,
  .Fired {
    @apply text-green-700 bg-green-100;
  }

  .CancelRequested,
  .TimedOut,
  .Signaled,
  .Cancelled {
    @apply text-yellow-700 bg-yellow-100;
  }

  .Failed,
  .Terminated {
    @apply text-red-700 bg-red-100;
  }
</style>
