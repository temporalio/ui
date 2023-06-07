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
    cancelableWorkflows,
    handleSelectAll,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';

  export let workflows: WorkflowExecution[];

  let coreUser = coreUserStore();
  let workflowsCount: number;
  let selectedWorkflowsCount: number;

  $: {
    workflowsCount = $workflowsQuery
      ? $workflowCount.count
      : $workflowCount.totalCount;
  }

  $: {
    selectedWorkflowsCount = $selectedWorkflows?.length ?? 0;
  }

  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );
</script>

{#if $allSelected}
  <span class="font-semibold">
    <Translate
      namespace="workflows"
      key="all-selected"
      count={workflowsCount}
    />
  </span>
{:else}
  <span class="font-semibold"
    ><Translate
      namespace="workflows"
      key="n-selected"
      count={selectedWorkflowsCount}
    /></span
  >
  <span>
    (or <button
      data-testid="select-all-workflows"
      on:click={() => handleSelectAll(workflows)}
      class="cursor-pointer underline"
      ><Translate
        namespace="workflows"
        key="select-all"
        count={workflowsCount}
      /></button
    >)
  </span>
{/if}
<div class="ml-4 inline-flex gap-2">
  {#if cancelEnabled}
    <BulkActionButton
      testId="bulk-cancel-button"
      disabled={namespaceWriteDisabled || !$cancelableWorkflows.length}
      on:click={openBatchCancelConfirmationModal}
      >{translate('workflows', 'request-cancellation')}</BulkActionButton
    >
  {/if}
  {#if terminateEnabled}
    <BulkActionButton
      variant="destructive"
      testId="bulk-terminate-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchTerminateConfirmationModal}
      >{translate('workflows', 'terminate')}</BulkActionButton
    >
  {/if}
</div>
