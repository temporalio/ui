<script lang="ts">
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsCompleted,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let event: IterableEvent;
  export let first = false;
  export let last = false;

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
  const completed = eventOrGroupIsCompleted(event);
</script>

<div class="flex w-[20px] min-w-[20px] flex-col items-center justify-center">
  <div class="flex h-[40px] w-[10x] gap-0" class:first class:last>
    <div class="w-[4px]" />
    <div class="w-[2px] bg-gray-900" />
    <div class="w-[4px]" />
  </div>
  <div
    class="dot"
    class:failure
    class:canceled
    class:terminated
    class:completed
  />
  <div class="flex w-[10x] grow gap-0">
    <div class="w-[4px]" />
    <div class="w-[2px] bg-gray-900" />
    <div class="w-[4px]" />
  </div>
</div>

<style lang="postcss">
  .dot {
    @apply h-3 w-3 rounded-full border-3 border-gray-900 bg-gray-900;
  }

  .first {
    @apply h-[0px];
  }

  .last {
    @apply h-full;
  }

  .dot.completed {
    @apply border-green-400 bg-green-400;
  }

  .dot.failure {
    @apply border-red-500 bg-red-500;
  }

  .dot.canceled {
    @apply border-yellow-300 bg-yellow-300;
  }

  .dot.terminated {
    @apply border-pink-500 bg-pink-500;
  }
</style>
