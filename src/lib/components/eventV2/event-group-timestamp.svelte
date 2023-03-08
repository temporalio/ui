<script lang="ts">
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsCompleted,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let event: IterableEvent;
  export let isSubGroup = false;

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
  const completed = eventOrGroupIsCompleted(event);
</script>

<div class="flex w-[20px] min-w-[20px] flex-col items-center justify-center">
  <div class="flex h-1/2 w-[10x] gap-0">
    <div class="w-[4px]" />
    <div class="w-[2px] bg-gray-900" />
    <div class="w-[4px]" />
  </div>
  <div
    class="grow"
    class:dot={!isSubGroup}
    class:subgroup-dot={isSubGroup}
    class:failure
    class:canceled
    class:terminated
    class:completed
  />
  <div class="flex h-1/2 w-[10x] gap-0">
    <div class="w-[4px]" />
    <div class="w-[2px] bg-gray-900" />
    <div class="w-[4px]" />
  </div>
</div>

<style lang="postcss">
  .dot {
    @apply h-3 w-3 rounded-full border-3 border-gray-900 bg-gray-900;
  }

  .subgroup-dot {
    @apply h-3 w-3 rounded-full border-2 border-gray-900 bg-gray-900;
  }

  .dot.completed {
    @apply bg-green-400 border-green-400;
  }

  .dot.failure {
    @apply bg-red-500 border-red-500;
  }

  .dot.canceled {
    @apply bg-yellow-300 border-yellow-300;
  }

  .dot.terminated {
    @apply bg-pink-500 border-pink-500;
  }
</style>
