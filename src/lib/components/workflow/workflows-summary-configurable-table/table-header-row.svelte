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

  const {
    handleSelectPage,
    selectedWorkflows,
    pageSelected,
    batchActionsVisible,
  } = getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    handleSelectPage(checked, workflows);
  };

  $: indeterminate =
    $selectedWorkflows.length > 0 &&
    $selectedWorkflows.length < workflows.length;
  $: label = translate('workflows.select-all-workflows');
</script>

<tr>
  {#if !empty && $supportsBulkActions}
    <th class="batch-actions-checkbox-table-cell">
      <Checkbox
        {label}
        labelHidden
        id="select-visible-workflows"
        data-testid="batch-actions-checkbox"
        bind:checked={$pageSelected}
        {indeterminate}
        on:change={handleCheckboxChange}
      />
    </th>
  {/if}
  <th class="w-12"></th>
  {#if $supportsBulkActions && $batchActionsVisible}
    <th class="batch-actions-table-cell" colspan={columnsCount}>
      <BatchActions {workflows} />
    </th>
  {:else}
    <slot />
  {/if}
  <th class="configuration-button-table-cell"></th>
</tr>

<style lang="postcss">
  .batch-actions-checkbox-table-cell {
    @apply w-10 rounded-tl-lg;
  }

  .batch-actions-table-cell {
    @apply overflow-visible whitespace-nowrap font-medium;
  }

  .configuration-button-table-cell {
    @apply h-10 w-10 py-1;
  }
</style>
