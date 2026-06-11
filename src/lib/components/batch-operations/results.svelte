<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { BatchOperation } from '$lib/types/batch';

  interface Props {
    operation: BatchOperation;
  }

  let { operation }: Props = $props();

  let {
    completeOperationCount = 0,
    failureOperationCount = 0,
    totalOperationCount = 0,
  } = $derived(operation);

  const getPercentage = (count: number, total: number) => {
    const percentage = Math.round((count / total) * 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  let completePercent = $derived(
    getPercentage(completeOperationCount, totalOperationCount),
  );
  let failurePercent = $derived(
    getPercentage(failureOperationCount, totalOperationCount),
  );
  let progressPercent = $derived(
    getPercentage(
      completeOperationCount + failureOperationCount,
      totalOperationCount,
    ),
  );
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
        {Intl.NumberFormat('en-US').format(completeOperationCount)} / {Intl.NumberFormat(
          'en-US',
        ).format(totalOperationCount)}
      </span>
    </div>
    <div class="relative h-2 w-full overflow-hidden rounded bg-indigo-100">
      <div
        class="absolute left-0 flex h-full items-center bg-indigo-600"
        style="width:{progressPercent}%;"
      ></div>
    </div>
  </div>

  <div>
    <div class="flex justify-between">
      <span class="text-xs font-semibold text-success"
        >{translate('batch.operations-succeeded', {
          count: completeOperationCount,
        })}</span
      >
      <span
        class="text-xs font-semibold"
        class:text-red-700={failurePercent > 0}
        >{translate('batch.operations-failed', {
          count: failureOperationCount,
        })}</span
      >
    </div>
    <div class="relative h-2 w-full overflow-hidden rounded">
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
