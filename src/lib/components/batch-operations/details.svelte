<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { BatchOperation } from '$lib/types/batch';
  import { formatDate } from '$lib/utilities/format-date';

  export let operation: BatchOperation;
</script>

<div class="flex flex-col gap-2">
  <p>{translate('batch.details')}</p>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {translate('batch.operation-type')}
    </p>
    <p class="batch-operation-value">{operation.operationType}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {translate('batch.identity')}
    </p>
    <p class="batch-operation-value">{operation.identity}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('common.reason')}</p>
    <p class="batch-operation-value">{operation.reason}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('common.start-time')}</p>
    <p class="batch-operation-value">
      {formatDate(operation.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('common.close-time')}</p>
    <p class="batch-operation-value">
      {formatDate(operation.closeTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {translate('batch.total-operations')}
    </p>
    <p class="batch-operation-value">
      {Intl.NumberFormat('en-US').format(operation.totalOperationCount)}
    </p>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .batch-operation-detail {
    @apply border-b text-sm last-of-type:border-b-0 max-sm:flex max-sm:flex-col sm:grid sm:grid-cols-10;
  }

  .batch-operation-key {
    @apply col-span-2 mr-2 text-sm font-semibold;
  }

  .batch-operation-value {
    @apply col-span-8;
  }
</style>
