<script lang="ts">
  import { noop } from 'svelte/internal';
  
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    batchActionsVisible,
    handleSelectPage,
    pageSelected,
    selectedWorkflows,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';
  
  import BatchActions from './batch-actions.svelte';

  export let workflows: WorkflowExecution[];
  export let empty: boolean;
  export let onClickConfigure: () => void = noop;
  export let columnsCount: number;

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    handleSelectPage(checked, workflows);
  };

  $: indeterminate =
    $selectedWorkflows.length > 0 &&
    $selectedWorkflows.length < workflows.length;
  $: label = translate('workflows', 'select-all-workflows');
</script>

<tr>
  {#if !empty && $supportsBulkActions}
    <th class="batch-actions-checkbox-table-cell">
      <Checkbox
        {label}
        labelHidden
        id="select-visible-workflows"
        data-testid="batch-actions-checkbox"
        onDark
        hoverable
        bind:checked={$pageSelected}
        {indeterminate}
        on:change={handleCheckboxChange}
      />
    </th>
  {/if}
  {#if $supportsBulkActions && $batchActionsVisible}
    <th class="batch-actions-table-cell" colspan={columnsCount}>
      <BatchActions {workflows} />
    </th>
  {:else}
    <slot />
  {/if}
  <th class="configuration-button-table-cell">
    <IconButton
      data-testid="workflows-summary-table-configuration-button"
      icon="vertical-ellipsis"
      label={translate('workflows', 'open-configure-workflows')}
      on:click={onClickConfigure}
    />
  </th>
</tr>

<style lang="postcss">
  .batch-actions-checkbox-table-cell {
    @apply w-10 rounded-tl-lg;
  }

  .batch-actions-table-cell {
    @apply text-left text-sm font-medium overflow-visible whitespace-nowrap font-secondary px-2;
  }

  .configuration-button-table-cell {
    @apply h-10 w-10 px-2;
  }
</style>
