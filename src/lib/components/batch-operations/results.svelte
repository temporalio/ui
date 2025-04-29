<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { BatchOperation } from '$lib/types/batch';

  export let operation: BatchOperation;

  let completePercent: number;
  let failurePercent: number;
  let progressPercent: number;

  $: {
    const {
      completeOperationCount,
      failureOperationCount,
      totalOperationCount,
    } = operation;

    completePercent = Math.round(
      (completeOperationCount / totalOperationCount) * 100,
    );

    failurePercent = Math.round(
      (failureOperationCount / totalOperationCount) * 100,
    );

    progressPercent = Math.round(
      ((completeOperationCount + failureOperationCount) / totalOperationCount) *
        100,
    );
  }
</script>

<div class="flex flex-col gap-4">
  <p>{translate('batch.results')}</p>
  <div>
    <div class="flex justify-between">
      <span class="text-xs font-semibold">
        {translate('batch.operations-progress', {
          percent: progressPercent,
        })}
      </span>
      <span class="text-xs font-semibold">
        {Intl.NumberFormat('en-US').format(operation.completeOperationCount)} / {Intl.NumberFormat(
          'en-US',
        ).format(operation.totalOperationCount)}
      </span>
    </div>
    <div class="relative h-2 w-full overflow-hidden rounded-sm bg-indigo-100">
      <div
        class="absolute left-0 flex h-full items-center bg-indigo-600"
        style="width:{progressPercent}%;"
      ></div>
    </div>
  </div>

  <div>
    <div class="flex justify-between">
      <span class=" text-xs font-semibold text-green-700"
        >{translate('batch.operations-succeeded', {
          count: operation.completeOperationCount,
        })}</span
      >
      <span
        class=" text-xs font-semibold"
        class:text-red-700={failurePercent > 0}
        >{translate('batch.operations-failed', {
          count: operation.failureOperationCount,
        })}</span
      >
    </div>
    <div class="relative h-2 w-full overflow-hidden rounded-sm">
      <div
        style="width:{completePercent}%;"
        class="absolute left-0 flex h-full items-center bg-green-200"
      ></div>
      <div
        style="width:{failurePercent}%;"
        class="absolute right-0 flex h-full items-center justify-end bg-red-200"
      ></div>
    </div>
  </div>
</div>
