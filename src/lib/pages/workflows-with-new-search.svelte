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
  import WorkflowDateTimeFilter from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';
  import WorkflowFilterSearch from '$lib/components/workflow/filter-search/index.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    batchCancelByQuery,
    batchTerminateByQuery,
    bulkCancelByIDs,
    bulkTerminateByIDs,
  } from '$lib/services/batch-service';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { persistedTimeFilter, workflowFilters } from '$lib/stores/filters';
  import { labsMode } from '$lib/stores/labs-mode';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import {
    loading,
    refresh,
    updating,
    workflowCount,
    workflows,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  $: query = $page.url.searchParams.get('query');
  $: query && ($workflowsQuery = query);

  // For returning to page from 'Back to Workflows' with previous search
  $: searchParams = $page.url.searchParams.toString();
  $: searchParams, ($workflowsSearchParams = searchParams);

  $: {
    if (!$workflowFilters.length) {
      $workflowsQuery = '';
    }
  }

  const persistTimeFilter = () => {
    if (!query && !$workflowFilters.length && $persistedTimeFilter) {
      $workflowFilters = [$persistedTimeFilter];
      updateQueryParamsFromFilter($page.url, $workflowFilters);
    }
  };

  $: $page.params.namespace, persistTimeFilter();

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = $labsMode
        ? toListWorkflowFilters(query, $searchAttributes)
        : toListWorkflowFilters(query);
    }
  });

  const resetSelection = () => {
    $allSelected = false;
    $pageSelected = false;
    $selectedWorkflows = [];
  };

  const refreshWorkflows = () => {
    resetSelection();
    $refresh = Date.now();
  };

  const terminateWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const options = {
      namespace: $page.params.namespace,
      reason: event.detail.reason,
    };
    try {
      if ($allSelected) {
        await batchTerminateByQuery({
          ...options,
          query: batchOperationQuery,
        });
        toaster.push({
          message: translate('workflows', 'batch-terminate-all-success'),
          id: 'batch-terminate-success-toast',
        });
      } else {
        const count = await bulkTerminateByIDs({
          ...options,
          workflows: $terminableWorkflows,
        });
        toaster.push({
          message: translate('workflows', 'batch-terminate-success', { count }),
          id: 'batch-terminate-success-toast',
        });
      }
      batchTerminateConfirmationModal?.close();
      refreshWorkflows();
    } catch (error) {
      batchTerminateConfirmationModal?.setError(
        error?.message ?? translate('unknown-error'),
      );
    }
  };

  const cancelWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const options = {
      namespace: $page.params.namespace,
      reason: event.detail.reason,
    };
    try {
      if ($allSelected) {
        await batchCancelByQuery({
          ...options,
          query: batchOperationQuery,
        });
        toaster.push({
          message: translate('workflows', 'batch-cancel-all-success'),
          id: 'batch-cancel-success-toast',
        });
      } else {
        const count = await bulkCancelByIDs({
          ...options,
          workflows: $cancelableWorkflows,
        });
        toaster.push({
          message: translate('workflows', 'batch-cancel-success', { count }),
          id: 'batch-cancel-success-toast',
        });
      }
      batchCancelConfirmationModal?.close();
      refreshWorkflows();
    } catch (error) {
      batchCancelConfirmationModal?.setError(
        error?.message ?? translate('unknown-error'),
      );
    }
  };

  $: batchOperationQuery = !$workflowsQuery
    ? 'ExecutionStatus="Running"'
    : $workflowsQuery;

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

<header class="flex justify-between items-center">
  <div>
    <h1 class="text-2xl" data-cy="workflows-title">
      <Translate namespace="workflows" key="recent-workflows" />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      {#if $workflowCount?.totalCount >= 0 && $supportsAdvancedVisibility && !$page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus}
        <p data-testid="workflow-count" data-loaded={!$loading && !$updating}>
          {#if $loading || $updating}
            <Translate namespace="workflows" key="loading-workflows" />
          {:else if query}
            <Translate
              namespace="workflows"
              key="filtered-workflows-count"
              replace={{
                filtered: $workflowCount.count,
                total: $workflowCount.totalCount,
              }}
            />
          {:else}
            <Translate
              namespace="workflows"
              key="workflows-count"
              count={$workflowCount.totalCount}
            />
          {/if}
        </p>
      {/if}
    </div>
  </div>
  <div class="flex gap-2 text-sm">
    <Link tabindex={0} on:click={() => exportWorkflows($workflows)}
      >{translate('download-json')}</Link
    >
    <IconButton
      icon="retry"
      label={translate('workflows', 'retry-workflows')}
      on:click={refreshWorkflows}
    />
  </div>
</header>
<WorkflowCounts />
<div class="flex flex-col md:flex-row gap-2">
  <LabsModeGuard>
    <svelte:fragment slot="fallback">
      <WorkflowAdvancedSearch />
    </svelte:fragment>
    <WorkflowFilterSearch />
  </LabsModeGuard>
  <WorkflowDateTimeFilter />
</div>
<WorkflowsSummaryConfigurableTable>
  <slot name="cloud" slot="cloud" />
</WorkflowsSummaryConfigurableTable>
