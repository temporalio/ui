<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { BatchOperation } from '$lib/types/batch';

  export let operation: BatchOperation;

  let completeWidth: number;
  let failureWidth: number;
  let progressPercent: number;
  let progressWidth: number;
  let resultsContainerWidth: number;
  let progressContainerWidth: number;

  $: {
    if (resultsContainerWidth) {
      const completePercent =
        operation.completeOperationCount / operation.totalOperationCount;
      const failurePercent =
        operation.failureOperationCount / operation.totalOperationCount;

      completeWidth = Math.floor(completePercent * resultsContainerWidth);
      failureWidth = Math.floor(failurePercent * resultsContainerWidth);
    }
  }

  $: {
    if (progressContainerWidth) {
      progressPercent =
        (operation.completeOperationCount + operation.failureOperationCount) /
        operation.totalOperationCount;

      progressWidth = Math.floor(progressPercent * progressContainerWidth);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <p>{translate('batch', 'results')}</p>
  <div>
    <p class="text-sm font-semibold">{translate('batch', 'progress')}</p>
    <div
      class="relative h-8 w-full overflow-hidden rounded bg-indigo-200"
      bind:clientWidth={progressContainerWidth}
    >
      <div
        class="absolute left-0 flex h-full items-center bg-indigo-600"
        style="width:{progressWidth}px;"
      >
        <span class="whitespace-nowrap px-2 text-xs font-semibold text-white">
          {translate('batch', 'operations-progress', {
            percent: Math.round(progressPercent * 100),
          })}
        </span>
      </div>
    </div>
  </div>

  <div>
    <p class="text-sm font-semibold">{translate('batch', 'success-failure')}</p>
    <div
      class="relative h-8 w-full overflow-hidden rounded"
      bind:clientWidth={resultsContainerWidth}
    >
      <div
        style="width:{completeWidth}px;"
        class="absolute left-0 flex h-full items-center bg-green-200"
      >
        <span
          class="whitespace-nowrap px-2 text-xs font-semibold text-green-700"
          >{translate('batch', 'operations-succeeded', {
            count: operation.completeOperationCount,
          })}</span
        >
      </div>
      <div
        style="width:{failureWidth}px;"
        class="absolute right-0 flex h-full items-center justify-end bg-red-200"
      >
        <span
          class="whitespace-nowrap px-2 text-xs font-semibold"
          class:text-red-700={failureWidth > 0}
          >{translate('batch', 'operations-failed', {
            count: operation.failureOperationCount,
          })}</span
        >
      </div>
    </div>
  </div>
</div>
