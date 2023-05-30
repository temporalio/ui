<script lang="ts">
  import { page } from '$app/stores';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import {
    allSelected,
    selectedWorkflows,
    handleSelectAll,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { derived } from 'svelte/store';

  export let workflows: WorkflowExecution[];

  const workflowsCount = derived(
    [workflowCount, workflowsQuery],
    ([{ count, totalCount }, query]) => {
      return new Intl.NumberFormat('en-US').format(query ? count : totalCount);
    },
  );

  let coreUser = coreUserStore();

  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );
</script>

{#if $allSelected}
  <span class="font-semibold">
    All {$workflowsCount} selected
  </span>
{:else}
  <span class="font-semibold">{$selectedWorkflows.length} selected</span>
  <span>
    (or <button
      data-testid="select-all-workflows"
      on:click={() => handleSelectAll(workflows)}
      class="cursor-pointer underline">select all {$workflowsCount}</button
    >)
  </span>
{/if}
<div class="ml-4 inline-flex gap-2">
  {#if cancelEnabled}
    <BulkActionButton
      testId="bulk-cancel-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchCancelConfirmationModal}
      >Request Cancellation</BulkActionButton
    >
  {/if}
  {#if terminateEnabled}
    <BulkActionButton
            testId="bulk-terminate-button"
            disabled={namespaceWriteDisabled}
            on:click={openBatchTerminateConfirmationModal}>Re-run</BulkActionButton
    >
  {/if}
  {#if terminateEnabled}
    <BulkActionButton
      variant="destructive"
      testId="bulk-terminate-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchTerminateConfirmationModal}>Terminate</BulkActionButton
    >
  {/if}
</div>
