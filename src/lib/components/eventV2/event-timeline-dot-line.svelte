<script lang="ts">
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let event: IterableEvent;
  export let isSubGroup = false;

  const failure = eventOrGroupIsFailureOrTimedOut(event);
  const canceled = eventOrGroupIsCanceled(event);
  const terminated = eventOrGroupIsTerminated(event);
</script>

<div class="flex h-full w-[20px] flex-col items-center justify-center">
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
  />
  <div class="flex h-1/2 w-[10x] gap-0">
    <div class="w-[4px]" />
    <div class="w-[2px] bg-gray-900" />
    <div class="w-[4px]" />
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
