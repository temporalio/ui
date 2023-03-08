<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  import { noop } from 'svelte/internal';
  import EventCard from './event-card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EventGroupTimestamp from './event-group-timestamp.svelte';
  import EventGroupDetails from './event-group-details.svelte';

  export let event: WorkflowEvent;
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;
  export let results: string = '';
  export let stackTrace: string = '';

  $: expanded = expandAll || active;

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
</script>

<div class="flex gap-2">
  <EventGroupTimestamp {event} {isSubGroup} />
  <div class="h-full grow pt-2">
    <EventCard bottom>
      <div
        class="row"
        id={event.id}
        class:expanded={expanded && !expandAll}
        aria-expanded={expanded || expandAll}
        class:active
        class:typedError
        data-testid="event-summary-row"
        on:click={onLinkClick}
        on:keydown={onLinkClick}
      >
        <div class="primary flex w-full cursor-pointer justify-between">
          <div class="flex items-center gap-4">
            <p>{event.id}</p>
            <div
              class="flex items-center"
              class:failure
              class:canceled
              class:terminated
            >
              <p
                class="event-name truncate text-sm font-semibold md:text-base xl:{isSubGroup
                  ? 'text-base'
                  : 'text-lg'}"
              >
                {event.name}
              </p>
            </div>
          </div>
          <div class="flex">
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
          </div>
        </div>
        {#if expanded}
          <div class="p-2">
            <EventGroupDetails {event} />
          </div>
        {/if}
      </div>
    </EventCard>
  </div>
</div>
<div class="flex gap-2">
  <div class="w-[20px]" />
  <div class="flex grow flex-col">
    <div class:code-with-stack-trace={stackTrace}>
      <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
        <CodeBlock
          content={results}
          title="Results"
          unroundTitle
          icon="json"
          class="h-auto {stackTrace ? 'mb-2' : ''}"
        />
      </div>
      {#if stackTrace}
        <div class="flex flex-col lg:w-1/2">
          <p class="text-sm">Stack trace</p>
          <CodeBlock
            content={stackTrace}
            title="Stack Trace"
            unroundTitle
            class="mb-2 h-full lg:pr-2"
            language="text"
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 py-2 pl-8 pr-2 text-sm no-underline xl:text-base;
  }

  .dot {
    @apply h-4 w-4 rounded-full border-3 border-gray-900 bg-white;
  }

  .subgroup-dot {
    @apply h-3 w-3 rounded-full border-2 border-gray-900 bg-white;
  }

  .dot.failure {
    @apply bg-red-500;
  }

  .failure p {
    @apply text-red-700;
  }

  .dot.canceled {
    @apply bg-yellow-300;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .dot.terminated {
    @apply bg-pink-500;
  }

  .terminated p {
    @apply text-pink-700;
  }

  .row.typedError {
    @apply rounded-lg;
  }

  .active {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }
</style>
