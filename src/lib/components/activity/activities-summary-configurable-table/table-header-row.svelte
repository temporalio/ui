<script lang="ts">
  import { getContext } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';

  import BatchActions from './batch-actions.svelte';

  interface Props {
    activities: ActivityExecutionInfo[];
    empty: boolean;
    columnsCount: number;
  }

  let { activities, empty, columnsCount }: Props = $props();

  const {
    handleSelectPage,
    selectedActivities,
    pageSelected,
    batchActionsVisible,
  } = getContext<ActivityBatchOperationContext>(
    ACTIVITY_BATCH_OPERATION_CONTEXT,
  );

  const handleCheckboxChange = (
    event: CustomEvent<{ checked: boolean }>,
  ): void => {
    const { checked } = event.detail;
    handleSelectPage(checked, activities);
  };

  const indeterminate = $derived(
    $selectedActivities.length > 0 &&
      $selectedActivities.length < activities.length,
  );
  const label = $derived(translate('activities.select-all-activities'));
</script>

<tr>
  {#if !empty && $supportsBulkActions}
    <th class="batch-actions-checkbox-table-cell">
      <Checkbox
        {label}
        labelHidden
        id="select-visible-activities"
        data-testid="activity-batch-actions-checkbox"
        bind:checked={$pageSelected}
        {indeterminate}
        on:change={handleCheckboxChange}
      />
    </th>
  {/if}
  <th class="w-6"></th>
  {#if $supportsBulkActions && $batchActionsVisible}
    <th class="batch-actions-table-cell" colspan={columnsCount}>
      <BatchActions {activities} />
    </th>
  {:else}
    <slot />
  {/if}
</tr>

<style lang="postcss">
  .batch-actions-checkbox-table-cell {
    @apply w-10;
  }

  .batch-actions-table-cell {
    @apply overflow-visible whitespace-nowrap font-medium;
  }
</style>
