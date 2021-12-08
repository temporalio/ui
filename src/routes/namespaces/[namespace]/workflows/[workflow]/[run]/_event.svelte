<script lang="ts">
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';
  import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

  import { goto } from '$app/navigation';

  import { getAttributesFromEvent } from '$lib/utilities/get-attributes-from-event';
  import { getEventClassification } from '$lib/utilities/get-event-classification';
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/components/code-block.svelte';
  import EventDetails from '$lib/components/event-details.svelte';

  export let event: HistoryEventWithId;
  export let expanded = false;

  const hash = `#event-${event.id}`;
  const summaryEvent = getAttributesFromEvent(event);

  onMount(() => {
    expanded = window.location.hash === hash;
  });

  const expand = () => {
    expanded = !expanded;
    if (expanded) {
      goto(hash);
    }
  };
</script>

<article
  id="event-{event.id}"
  class="w-full py-2 event-box border-2 rounded-lg relative"
  on:click={expand}
>
  <div class="absolute right-6 top-7">
    <Fa icon={expanded ? faAngleUp : faAngleDown} scale={1.2} />
  </div>
  <div class="flex items-start p-4 mx-4">
    <h2 class="w-1/3 {event.eventType}">
      <span class="label {getEventClassification(event)}">
        {format(String(event.eventType))}
      </span>
    </h2>
    <div class="flex items-center event gap-4 w-full">
      {#each Object.entries(summaryEvent.attributes) as [attribute, value]}
        {#if typeof value === 'object'}
          <div class="flex gap-2 flex-nowrap">
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
  </div>
  {#if expanded}<EventDetails {event} />{/if}
</article>

<style lang="postcss">
  h4 {
    @apply whitespace-nowrap;
  }

  article:hover {
    @apply cursor-pointer;
  }

  .event-box {
    margin: 1rem 0;
  }

  .label {
    @apply bg-gray-300 px-2 rounded-sm;
  }

  .Scheduled {
    @apply text-gray-700 bg-gray-300;
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
