<script lang="ts">
  import { createTranslate, translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { BatchOperation } from '$lib/types/batch';
  import { formatDate } from '$lib/utilities/format-date';

  export let operation: BatchOperation;
  const t = createTranslate('batch');
</script>

<div class="flex flex-col gap-2">
  <p>{t('details')}</p>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {t('operation-type')}
    </p>
    <p class="batch-operation-value">{operation.operationType}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {t('identity')}
    </p>
    <p class="batch-operation-value">{operation.identity}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('reason')}</p>
    <p class="batch-operation-value">{operation.reason}</p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('start-time')}</p>
    <p class="batch-operation-value">
      {formatDate(operation.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">{translate('close-time')}</p>
    <p class="batch-operation-value">
      {formatDate(operation.closeTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="batch-operation-detail">
    <p class="batch-operation-key">
      {t('total-operations')}
    </p>
    <p class="batch-operation-value">
      {Intl.NumberFormat('en-US').format(operation.totalOperationCount)}
    </p>
  </div>
</div>

<style lang="postcss">
  .batch-operation-detail {
    @apply grid grid-cols-10 border-b text-sm last-of-type:border-b-0;
  }

  .batch-operation-key {
    @apply col-span-2 text-sm font-semibold;
  }

  .batch-operation-value {
    @apply col-span-8;
  }
</style>
