<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsCompleted,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  export let event: IterableEvent | undefined;
  export let removeHead = false;
  export let removeTail = false;
  export let pending = false;
  export let firstEvent: IterableEvent | undefined = undefined;
  export let events: IterableEvent[] = [];

  $: failure = event && eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = event && eventOrGroupIsCanceled(event);
  $: terminated = event && eventOrGroupIsTerminated(event);
  $: completed = event && eventOrGroupIsCompleted(event);
  $: running = !event;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && firstEvent && event.id !== firstEvent.id;

  $: timeDiffChange = '';
  $: {
    const currentIndex = events.indexOf(event);
    const previousItem = events[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: isEventGroup(previousItem)
          ? previousItem?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: lastEvent?.eventTime,
      });
      timeDiffChange = timeDiff ? `(+${timeDiff})` : '';
    }
  }

  $: displayedTime = showElapsedTimeDiff
    ? formatDistanceAbbreviated({
        start: firstEvent.eventTime,
        end: initialEvent.eventTime,
      }) + timeDiffChange
    : formatDate(initialEvent?.eventTime, $timeFormat);
</script>

<div
  class="flex w-[140px] min-w-[140px] pt-[4px] flex-col items-end break-word leading-0 truncate text-right text-[14px] text-gray-700 md:whitespace-normal"
  class:relative-time={$timeFormat === 'relative' || showElapsedTimeDiff}
>
  {displayedTime}
</div>
<div class="flex w-[20px] min-w-[20px] flex-col items-center justify-center">
  <div class="flex h-[20px] w-[10x] gap-0">
    <div class="w-[4px]" />
    <div
      class="line"
      class:no-line={removeHead}
      class:dashed={running || pending}
    />
    <div class="w-[4px]" />
  </div>
  <div
    class="dot"
    class:failure
    class:canceled
    class:terminated
    class:completed
    class:running
    class:pending
  />
  <div class="flex w-[10x] grow gap-0">
    <div class="w-[4px]" />
    <div class="line" class:no-line={removeTail} class:dashed={pending} />
    <div class="w-[4px]" />
  </div>
</div>

<style lang="postcss">
  .dot {
    @apply h-3 w-3 rounded-full border-2 border-gray-700 bg-gray-900;
  }

  .line {
    @apply w-[1px] border border-gray-900;
  }

  .no-line {
    @apply border-none;
  }

  .relative-time {
    @apply pt-[16px];
  }

  .dashed {
    @apply border-dashed;
  }

  .dot.completed {
    @apply border-green-700 bg-green-400;
  }

  .dot.failure {
    @apply border-red-700 bg-red-500;
  }

  .dot.canceled {
    @apply border-yellow-700 bg-yellow-300;
  }

  .dot.terminated {
    @apply border-pink-700 bg-pink-500;
  }

  .dot.running {
    @apply border-gray-700 bg-gray-500;
  }

  .dot.pending {
    @apply bg-white;
  }
</style>
