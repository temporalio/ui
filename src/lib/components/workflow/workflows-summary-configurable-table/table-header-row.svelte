<script lang="ts">
  import { getContext } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import BatchActions from './batch-actions.svelte';

  export let workflows: WorkflowExecution[];
  export let empty: boolean;
  export let columnsCount: number;
  export let pageSelectionStatus: 'checked' | 'unchecked' | 'partial' =
    'unchecked';
  export let onSelectPage: (
    selected: boolean,
    workflows: WorkflowExecution[],
  ) => void;

  const { batchActionsVisible } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    onSelectPage(checked, workflows);
  };
  const label = translate('workflows.select-all-workflows');
</script>

<tr>
  {#if !empty && $supportsBulkActions}
    <th class="batch-actions-checkbox-table-cell">
      <Checkbox
        {label}
        labelHidden
        id="select-visible-workflows"
        data-testid="batch-actions-checkbox"
        checked={pageSelectionStatus === 'checked'}
        indeterminate={pageSelectionStatus === 'partial'}
        on:change={handleCheckboxChange}
      />
    </th>
  {/if}
  <th class="w-6"></th>
  {#if $supportsBulkActions && $batchActionsVisible}
    <th class="batch-actions-table-cell" colspan={columnsCount}>
      <BatchActions {workflows} />
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
