<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import Button from '$lib/anthropocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { isCloud } from '$lib/stores/advanced-visibility';
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

  $: terminateEnabled = workflowTerminateEnabled(
    $page.data.settings,
    $coreUser,
    $page.params.namespace,
  );

  $: cancelEnabled = workflowCancelEnabled(
    $page.data.settings,
    $coreUser,
    $page.params.namespace,
  );

  $: resetEnabled =
    workflowResetEnabled(
      $page.data.settings,
      $coreUser,
      $page.params.namespace,
    ) && $isCloud
      ? true
      : minimumVersionRequired('1.23.0', $temporalVersion);
</script>

{#if $allSelected}
  <span class="font-medium">
    <Translate key="workflows.all-selected" count={$workflowCount.count} />
  </span>
{:else}
  <span class="font-medium"
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
      variant="ghost"
      class="focus-visible:border-table"
      data-testid="bulk-cancel-button"
      disabled={!$cancelableWorkflows.length}
      on:click={openBatchCancelConfirmationModal}
      >{translate('workflows.request-cancellation')}</Button
    >
  {/if}
  {#if resetEnabled}
    <Button
      size="xs"
      variant="ghost"
      class="focus-visible:border-table"
      data-testid="bulk-reset-button"
      on:click={openBatchResetConfirmationModal}
      >{translate('workflows.reset')}</Button
    >
  {/if}
  {#if terminateEnabled}
    <Button
      size="xs"
      variant="destructive"
      class="focus-visible:border-table"
      data-testid="bulk-terminate-button"
      on:click={openBatchTerminateConfirmationModal}
      >{translate('workflows.terminate')}</Button
    >
  {/if}
</div>
