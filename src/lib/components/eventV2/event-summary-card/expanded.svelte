<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import {
    getCodeBlockValue,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';

  import { isEventGroup } from '$lib/models/event-groups';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Details from './details.svelte';
  import { getAttributePayloads } from '../event-detail-keys';
  import EventGroupSummaryCard from '../event-group-summary-card.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: payloadAttributes = getAttributePayloads(event.attributes);
</script>

{#if isEventGroup(event) && hasGroupEvents}
  <div class="secondary">
    {#each event.eventList as groupEvent, index}
      <EventGroupSummaryCard
        event={groupEvent}
        {events}
        {firstEvent}
        last={index === event.eventList.length - 1}
      />
    {/each}
  </div>
{/if}
{#if !hasGroupEvents}
  {#each payloadAttributes as attribute}
    {@const codeBlockValue = getCodeBlockValue(attribute.value)}
    {@const stackTrace = getStackTrace(codeBlockValue)}
    <div class="mt-4" class:code-with-stack-trace={stackTrace}>
      <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
        <p class="text-sm">{format(attribute.key)}</p>
        <CodeBlock
          content={codeBlockValue}
          class="h-auto {stackTrace ? 'mb-2' : ''}"
        />
      </div>
      {#if stackTrace}
        <div class="flex flex-col lg:w-1/2">
          <p class="text-sm">Stack trace</p>
          <CodeBlock
            content={stackTrace}
            class="mb-2 h-full lg:pr-2"
            language="text"
          />
        </div>
      {/if}
    </div>
  {/each}
  <Details event={initialEvent} />
{/if}

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 py-2 pl-8 pr-2 text-sm no-underline xl:text-base;
  }

  .secondary {
    @apply mt-2 flex flex-col;
  }

  .failure p {
    @apply text-red-700;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .terminated p {
    @apply text-pink-700;
  }

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }
</style>
