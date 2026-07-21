<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsWorkflowBulkActions } from '$lib/stores/workflow-bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import BatchActions from './batch-actions.svelte';

  type Props = {
    workflows: WorkflowExecution[];
    empty: boolean;
    columnsCount: number;
    pageSelectionStatus?: 'checked' | 'unchecked' | 'partial';
    onSelectPage: (selected: boolean, workflows: WorkflowExecution[]) => void;
    children?: Snippet;
  };

  let {
    workflows,
    empty,
    columnsCount,
    pageSelectionStatus = 'unchecked',
    onSelectPage,
    children,
  }: Props = $props();

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
  {#if !empty && $supportsWorkflowBulkActions}
    <th scope="col" class="batch-actions-checkbox-table-cell">
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
  <th scope="col" class="w-6"></th>
  {#if $supportsWorkflowBulkActions && $batchActionsVisible}
    <th scope="col" class="batch-actions-table-cell" colspan={columnsCount}>
      <BatchActions {workflows} />
    </th>
  {:else}
    {@render children?.()}
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
