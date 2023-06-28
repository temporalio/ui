<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import BatchActions from './batch-actions.svelte';
  import {
    pageSelected,
    handleSelectPage,
    selectedWorkflows,
    batchActionsVisible,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { noop } from 'svelte/internal';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';

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
</script>

<tr>
  {#if $supportsBulkActions}
    <th class="batch-actions-checkbox-table-cell">
      {#if !empty}
        <Checkbox
          id="select-visible-workflows"
          data-testid="batch-actions-checkbox"
          aria-label="select all workflows"
          onDark
          hoverable
          bind:checked={$pageSelected}
          {indeterminate}
          on:change={handleCheckboxChange}
        />
      {/if}
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
      on:click={onClickConfigure}
    />
  </th>
</tr>

<style lang="postcss">
  .batch-actions-checkbox-table-cell {
    @apply min-w-[40px] rounded-tl-lg;
  }

  .batch-actions-table-cell {
    @apply text-left text-sm font-medium overflow-visible whitespace-nowrap font-secondary px-2;
  }

  .configuration-button-table-cell {
    @apply h-10 leading-[48px] text-right sticky right-0 block w-auto bg-primary;
  }
</style>
