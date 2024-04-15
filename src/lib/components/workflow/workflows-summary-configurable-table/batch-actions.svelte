<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { temporalVersion } from '$lib/stores/versions';
  import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { minimumVersionRequired } from '$lib/utilities/version-check';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

  export let workflows: WorkflowExecution[];

  const {
    selectedWorkflows,
    allSelected,
    handleSelectAll,
    cancelableWorkflows,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
    openBatchResetConfirmationModal,
  } = getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  let coreUser = coreUserStore();
  let selectedWorkflowsCount: number;

  $: {
    selectedWorkflowsCount = $selectedWorkflows?.length ?? 0;
  }

  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: resetEnabled =
    workflowResetEnabled($page.data.settings) &&
    minimumVersionRequired('1.23', $temporalVersion);
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
  {#if $workflowsQuery}
    <span>
      ({translate('workflows.select-all-leading')}
      <button
        data-testid="select-all-workflows"
        on:click={() => handleSelectAll(workflows)}
        class="cursor-pointer underline"
        ><Translate
          key="workflows.select-all"
          count={$workflowCount.count}
        /></button
      >
      {translate('workflows.select-all-trailing')})
    </span>
  {/if}
{/if}
<div class="ml-4 inline-flex gap-2">
  {#if cancelEnabled}
    <Button
      size="xs"
      variant="table-header"
      data-testid="bulk-cancel-button"
      disabled={namespaceWriteDisabled || !$cancelableWorkflows.length}
      on:click={openBatchCancelConfirmationModal}
      >{translate('workflows.request-cancellation')}</Button
    >
  {/if}
  {#if resetEnabled}
    <Button
      size="xs"
      variant="table-header"
      data-testid="bulk-reset-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchResetConfirmationModal}
      >{translate('workflows.reset')}</Button
    >
  {/if}
  {#if terminateEnabled}
    <Button
      size="xs"
      variant="destructive"
      data-testid="bulk-terminate-button"
      disabled={namespaceWriteDisabled}
      on:click={openBatchTerminateConfirmationModal}
      >{translate('workflows.terminate')}</Button
    >
  {/if}
</div>
