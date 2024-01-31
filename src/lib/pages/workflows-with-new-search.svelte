<script lang="ts" context="module">
  let batchTerminateConfirmationModal: BatchOperationConfirmationModal;
  let batchCancelConfirmationModal: BatchOperationConfirmationModal;
  export const allSelected = writable<boolean>(false);
  export const pageSelected = writable<boolean>(false);
  export const selectedWorkflows = writable<WorkflowExecution[]>([]);

  export const batchActionsVisible = derived(
    selectedWorkflows,
    (workflows) => workflows.length > 0,
  );

  export const terminableWorkflows = derived(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.canBeTerminated),
  );

  export const cancelableWorkflows = derived(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.status === 'Running'),
  );

  export const openBatchCancelConfirmationModal = () => {
    batchCancelConfirmationModal?.open();
  };

  export const openBatchTerminateConfirmationModal = () => {
    batchTerminateConfirmationModal?.open();
  };

  export const handleSelectAll = (workflows: WorkflowExecution[]) => {
    allSelected.set(true);
    selectedWorkflows.set([...workflows]);
  };

  export const handleSelectPage = (
    checked: boolean,
    workflows: WorkflowExecution[],
  ) => {
    pageSelected.set(checked);
    if (allSelected) allSelected.set(false);
    if (checked) {
      selectedWorkflows.set([...workflows]);
    } else {
      selectedWorkflows.set([]);
    }
  };
</script>

<script lang="ts">
  import { derived, writable } from 'svelte/store';

  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import BatchOperationConfirmationModal from '$lib/components/workflow/batch-operation-confirmation-modal.svelte';
  import WorkflowFilterSearch from '$lib/components/workflow/filter-search/index.svelte';
  import WorkflowCountRefresh from '$lib/components/workflow/workflow-count-refresh.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    batchCancelWorkflows,
    batchTerminateWorkflows,
  } from '$lib/services/batch-service';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { workflowFilters } from '$lib/stores/filters';
  import { groupByCountEnabled } from '$lib/stores/group-by-enabled';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import {
    updating,
    workflowCount,
    workflows,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  $: query = $page.url.searchParams.get('query');
  $: query, ($workflowsQuery = query);
  $: batchOperationQuery = $workflowsQuery ?? 'ExecutionStatus="Running"';

  // For returning to page from 'Back to Workflows' with previous search
  $: searchParams = $page.url.searchParams.toString();
  $: searchParams, ($workflowsSearchParams = searchParams);

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = toListWorkflowFilters(query, $searchAttributes);
    }
  });

  const resetSelection = () => {
    $allSelected = false;
    $pageSelected = false;
    $selectedWorkflows = [];
  };

  const terminateWorkflows = async (
    event: CustomEvent<{ reason: string; jobId: string }>,
  ) => {
    try {
      const options = {
        namespace: $page.params.namespace,
        reason: event.detail.reason,
        jobId: event.detail.jobId,
        ...($allSelected
          ? { query: batchOperationQuery }
          : { workflows: $terminableWorkflows }),
      };
      await batchTerminateWorkflows(options);
      batchTerminateConfirmationModal?.close();
      toaster.push({
        message: translate('workflows.batch-terminate-all-success'),
        id: 'batch-terminate-success-toast',
      });
    } catch (error) {
      batchTerminateConfirmationModal?.setError(
        error?.message ?? translate('common.unknown-error'),
      );
    }
  };

  const cancelWorkflows = async (
    event: CustomEvent<{ reason: string; jobId: string }>,
  ) => {
    const options = {
      namespace: $page.params.namespace,
      reason: event.detail.reason,
      jobId: event.detail.jobId,
      ...($allSelected
        ? { query: batchOperationQuery }
        : { workflows: $terminableWorkflows }),
    };
    try {
      await batchCancelWorkflows(options);
      batchCancelConfirmationModal?.close();
      toaster.push({
        message: translate('workflows.batch-cancel-all-success'),
        id: 'batch-cancel-success-toast',
      });
    } catch (error) {
      batchCancelConfirmationModal?.setError(
        error?.message ?? translate('common.unknown-error'),
      );
    }
  };

  $: {
    if ($updating) {
      resetSelection();
    }
  }
</script>

<BatchOperationConfirmationModal
  action={Action.Terminate}
  bind:this={batchTerminateConfirmationModal}
  actionableWorkflowsLength={$terminableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={terminateWorkflows}
/>

<BatchOperationConfirmationModal
  action={Action.Cancel}
  bind:this={batchCancelConfirmationModal}
  actionableWorkflowsLength={$cancelableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={cancelWorkflows}
/>

<header class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="flex items-center gap-2 text-2xl" data-cy="workflows-title">
        {#if $supportsAdvancedVisibility}
          <span data-testid="workflow-count"
            >{$workflowCount.count.toLocaleString()}</span
          >
          <Translate
            key="common.workflows-plural"
            count={$workflowCount.count}
          />
        {:else}
          <Translate key="workflows.recent-workflows" />
        {/if}
        <WorkflowCountRefresh count={$workflowCount.newCount} />
      </h1>
    </div>
    <div class="flex items-center gap-2 text-sm">
      <button
        class="underline hover:text-blue-700"
        tabindex={0}
        on:click={() => exportWorkflows($workflows)}
        >{translate('common.download-json')}</button
      >
    </div>
  </div>
  {#if $groupByCountEnabled}
    <WorkflowCounts />
  {/if}
</header>

<div class="flex flex-col gap-2 md:flex-row">
  <WorkflowFilterSearch />
</div>
<WorkflowsSummaryConfigurableTable>
  <slot name="cloud" slot="cloud" />
</WorkflowsSummaryConfigurableTable>
