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
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import EventGroupTimestamp from './event-group-timestamp.svelte';
  import PrimaryEventGroupDetails from './primary-event-group-details.svelte';

  export let event: WorkflowEvent;
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;
  export let input: string = '';

  $: expanded = expandAll || active;
  let showFullDetails = false;

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
</script>

<div class="flex gap-2">
  <div class="w-[20px]" />
  <div class="flex flex-col grow">
    <CodeBlock content={input} title="Input" icon="json" class="h-auto" />
  </div>
</div>
<div class="flex gap-2">
  <EventGroupTimestamp {event} {isSubGroup} />
  <div class="h-full grow pb-2">
    <EventCard top>
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
      </div>
      {#if expanded}
        <div class="p-2">
          <!-- <PrimaryEventGroupDetails {event} /> -->
        </div>
      {/if}
      {#if showFullDetails}
        <p>Full Event Details</p>
        <div class="h-80">
          <CodeBlock content={stringifyWithBigInt(event)} />
        </div>
      {/if}
    </EventCard>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 pl-8 pr-2 text-sm no-underline xl:py-3 xl:text-base;
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
  }

  .active {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }
</style>
