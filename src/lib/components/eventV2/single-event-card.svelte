<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { eventShowElapsed, eventFilterSort } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';

  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { noop } from 'svelte/internal';
  import { isEventGroup } from '$lib/models/event-groups';
  import EventCard from './event-card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';
  import { getStackTrace } from '$lib/utilities/get-single-attribute-for-event';
  import { eventHistory } from '$lib/stores/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import EventTimelineDotLine from './event-timeline-dot-line.svelte';
  import EventGroupTimestamp from './event-group-timestamp.svelte';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent | undefined;
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  $: expanded = expandAll || active;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: descending = $eventFilterSort === 'descending';
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: isEventGroup(previousItem)
          ? previousItem?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: lastEvent?.eventTime,
      });
      timeDiffChange = timeDiff ? `(${descending ? '-' : '+'}${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);

  $: ({ input, results } =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory));
  $: isInitialEvent = event.id === $eventHistory.start[0]?.id;
  $: codeBlockContent = isInitialEvent ? input : results;
  $: stackTrace =
    isInitialEvent &&
    codeBlockContent &&
    getStackTrace(parseWithBigInt(codeBlockContent));
</script>

<div class="flex gap-4">
  <div class="flex h-full w-[120px] items-center justify-center">
    <EventGroupTimestamp {event} {initialItem} {visibleItems} />
    <EventTimelineDotLine {event} isSubGroup />
  </div>
  <div class="h-full grow py-2">
    <EventCard>
      <div
        class="row"
        id={lastEvent.id}
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
            <p>{lastEvent.id}</p>
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
        <div class="p-2">
          <div class:code-with-stack-trace={stackTrace}>
            <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
              <CodeBlock
                content={codeBlockContent}
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
        </div>
        {#if expanded}
          <p>Full Event Details</p>
          <div class="h-80">
            <CodeBlock content={stringifyWithBigInt(lastEvent)} />
          </div>
        {/if}
      </div>
    </EventCard>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 pl-8 pr-2 text-sm no-underline xl:py-3 xl:text-base;
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
