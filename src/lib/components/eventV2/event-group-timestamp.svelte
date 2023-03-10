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
  export let removeTail = false;

  $: failure = eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = eventOrGroupIsCanceled(event);
  $: terminated = eventOrGroupIsTerminated(event);
  $: completed = eventOrGroupIsCompleted(event);
</script>

<div class="flex w-[20px] min-w-[20px] flex-col items-center justify-center">
  <div class="flex h-[40px] w-[10x] gap-0" class:first>
    <div class="w-[4px]" />
    <div class="w-[2px]" class:line={!first} />
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
    <div class="w-[2px]" class:line={!removeTail && !last} />
    <div class="w-[4px]" />
  </div>
</div>

<style lang="postcss">
  .dot {
    @apply h-3 w-3 rounded-full border-3 border-gray-700 bg-gray-900;
  }

  .first {
    @apply h-[30px];
  }

  .line {
    @apply bg-gray-900;
  }

  .dot.completed {
    @apply border-green-300 bg-green-400;
  }

  .dot.failure {
    @apply border-red-400 bg-red-500;
  }

  .dot.canceled {
    @apply border-yellow-200 bg-yellow-300;
  }

  .dot.terminated {
    @apply border-pink-400 bg-pink-500;
  }
</style>
