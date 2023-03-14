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
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';

  export let event: WorkflowEvent;
  export let initialItem: WorkflowEvent;
  export let visibleItems: WorkflowEvent[];
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;
  export let content: string = '';
  export let stackTrace: string = '';

  $: expanded = expandAll || active;

  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: previousItem?.eventTime,
        end: event?.eventTime,
      });
      timeDiffChange = timeDiff ? `(+${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
</script>

<div class="flex gap-2">
  <EventGroupTimestamp {event} last />
  <div class="h-full grow pt-2">
    <EventCard bottom>
      <div
        class="row"
        id={event.id}
        class:expanded={expanded && !expandAll}
        aria-expanded={expanded || expandAll}
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
            <EventGroupDetails {event} primary />
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
          </div>
        </div>
        <p
          class="break-word leading-0 truncate text-left text-sm text-gray-700 md:whitespace-normal"
        >
          {#if showElapsedTimeDiff}
            {formatDistanceAbbreviated({
              start: initialItem.eventTime,
              end: event.eventTime,
            })}
            {timeDiffChange}
          {:else}
            {formatDate(event?.eventTime, $timeFormat)}
          {/if}
        </p>
      </div>
      {#if expanded}
        <div class="p-2">
          <EventGroupDetails {event} />
        </div>
      {/if}
    </EventCard>
  </div>
</div>
<div class="flex gap-2">
  <div class="w-[20px] min-w-[20px]" />
  <div class="flex grow flex-col overflow-auto">
    <div class:code-with-stack-trace={stackTrace}>
      <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
        <CodeBlock
          {content}
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
</style>
