<script lang="ts">
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsCompleted,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let event: IterableEvent | undefined;
  export let first = false;
  export let last = false;
  export let removeTail = false;
  export let pending = false;

  $: failure = event && eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = event && eventOrGroupIsCanceled(event);
  $: terminated = event && eventOrGroupIsTerminated(event);
  $: completed = event && eventOrGroupIsCompleted(event);
  $: running = !event;
</script>

<div class="flex w-[20px] min-w-[20px] flex-col items-center justify-center">
  <div class="flex h-[36px] w-[10x] gap-0" class:first>
    <div class="w-[4px]" />
    <div class="line" class:no-line={first} class:dashed={running || pending} />
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
    <div
      class="line"
      class:no-line={removeTail || last}
      class:dashed={pending}
    />
    <div class="w-[4px]" />
  </div>
</div>

<style lang="postcss">
  .dot {
    @apply h-3 w-3 rounded-full border-2 border-gray-700 bg-gray-900;
  }

  .line {
    @apply w-[2px] border-2 border-gray-900;
  }

  .no-line {
    @apply border-none;
  }

  .dashed {
    @apply border-dashed;
  }

  .first {
    @apply h-[30px];
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

  .dot.running {
    @apply border-gray-400 bg-gray-500;
  }

  .dot.pending {
    @apply bg-white;
  }
</style>
