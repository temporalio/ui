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
    batchCancelConfirmationModal.open();
  };

  export const openBatchTerminateConfirmationModal = () => {
    batchTerminateConfirmationModal.open();
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
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { page } from '$app/stores';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowCount,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { persistedTimeFilter, workflowFilters } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import Pagination from '$lib/holocene/pagination.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import WorkflowDateTimeFilter from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';
  import {
    batchCancelByQuery,
    batchTerminateByQuery,
    bulkCancelByIDs,
    bulkTerminateByIDs,
  } from '$lib/services/batch-service';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import BatchOperationConfirmationModal from '$lib/components/workflow/batch-operation-confirmation-modal.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { toaster } from '$lib/stores/toaster';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import Translate from '$lib/i18n/translate.svelte';
  import { translate } from '$lib/i18n/translate';

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
      $workflowFilters = toListWorkflowFilters(query);
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

  const resetPageToDefaultState = () => {
    $workflowFilters = [];
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
    });
    refreshWorkflows();
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
      resetPageToDefaultState();
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
      resetPageToDefaultState();
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

<header class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl" data-cy="workflows-title">
      <Translate namespace="workflows" key="recent-workflows" />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-testid="namespace-name">
        {$page.params.namespace}
      </p>
      {#if $workflowCount?.totalCount >= 0 && $supportsAdvancedVisibility}
        <div class="h-1 w-1 rounded-full bg-gray-400" />
        <p data-testid="workflow-count" data-loaded={!$loading && !$updating}>
          {#if $loading}
            <span class="text-gray-400"
              ><Translate namespace="common" key="loading" /></span
            >
          {:else if $updating}
            <span class="text-gray-400"
              ><Translate namespace="common" key="filtering" /></span
            >
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
  <div>
    <button
      aria-label="retry workflows"
      class="cursor-pointer rounded-full p-1 hover:bg-gray-900 hover:text-white"
      on:click={refreshWorkflows}
    >
      <Icon name="retry" class="h-8 w-8" />
    </button>
  </div>
</header>
<Pagination items={$workflows} let:visibleItems aria-label="recent workflows">
  <svelte:fragment slot="action-top-left">
    <WorkflowAdvancedSearch />
  </svelte:fragment>
  <svelte:fragment slot="action-top-center">
    <WorkflowDateTimeFilter />
  </svelte:fragment>
  <WorkflowsSummaryConfigurableTable workflows={visibleItems} />
</Pagination>
