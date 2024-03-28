<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { workflowCount } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

  export let workflows: WorkflowExecution[];

  const {
    selectedWorkflows,
    allSelected,
    handleSelectAll,
    cancelableWorkflows,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
  } = getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  let coreUser = coreUserStore();
  let selectedWorkflowsCount: number;

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
    <Translate key="workflows.all-selected" count={$workflowCount.count} />
  </span>
{:else}
  <span class="font-semibold"
    ><Translate
      key="workflows.n-selected"
      count={selectedWorkflowsCount}
    /></span
  >
  <span>
    (or <button
      data-testid="select-all-workflows"
      on:click={() => handleSelectAll(workflows)}
      class="cursor-pointer underline"
      ><Translate
        key="workflows.select-all"
        count={$workflowCount.count}
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
      >{translate('workflows.request-cancellation')}</BulkActionButton
    >
  {/if}
  {#if terminateEnabled}
    <BulkActionButton
      variant="destructive"
      testId="bulk-terminate-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchTerminateConfirmationModal}
      >{translate('workflows.terminate')}</BulkActionButton
    >
  {/if}
</div>
