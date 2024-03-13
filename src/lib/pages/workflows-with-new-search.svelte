<script lang="ts" context="module">
  import type { Readable, Writable } from 'svelte/store';

  import type { WorkflowExecution } from '$lib/types/workflows';

  export const BATCH_OPERATION_CONTEXT = 'BATCH_OPERATION_CONTEXT';

  export type BatchOperationContext = {
    allSelected: Writable<boolean>;
    pageSelected: Writable<boolean>;
    terminableWorkflows: Readable<WorkflowExecution[]>;
    cancelableWorkflows: Readable<WorkflowExecution[]>;
    selectedWorkflows: Writable<WorkflowExecution[]>;
    batchActionsVisible: Readable<boolean>;
    query: Readable<string>;
    openBatchCancelConfirmationModal: () => void;
    openBatchTerminateConfirmationModal: () => void;
    handleSelectAll: (workflows: WorkflowExecution[]) => void;
    handleSelectPage: (
      checked: boolean,
      workflows: WorkflowExecution[],
    ) => void;
  };
</script>

<script lang="ts">
  import { derived, writable } from 'svelte/store';

  import { onMount, setContext } from 'svelte';

  import { page } from '$app/stores';

  import BatchCancelConfirmationModal from '$lib/components/workflow/client-actions/batch-cancel-confirmation-modal.svelte';
  import BatchTerminateConfirmationModal from '$lib/components/workflow/client-actions/batch-terminate-confirmation-modal.svelte';
  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import WorkflowFilterSearch from '$lib/components/workflow/filter-search/index.svelte';
  import WorkflowCountRefresh from '$lib/components/workflow/workflow-count-refresh.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { workflowFilters } from '$lib/stores/filters';
  import { groupByCountEnabled } from '$lib/stores/group-by-enabled';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    refresh,
    updating,
    workflowCount,
    workflows,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  $: query = $page.url.searchParams.get('query');
  $: query, ($workflowsQuery = query);
  $: namespace = $page.params.namespace;

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

  let batchTerminateConfirmationModalOpen = false;
  let batchCancelConfirmationModalOpen = false;
  let terminateConfirmationModalOpen = false;
  let cancelConfirmationModalOpen = false;
  const batchOperationQuery = derived(
    workflowsQuery,
    (query) => query ?? 'ExecutionStatus="Running"',
  );
  const allSelected = writable<boolean>(false);
  const pageSelected = writable<boolean>(false);
  const selectedWorkflows = writable<WorkflowExecution[]>([]);
  const batchActionsVisible = derived(
    selectedWorkflows,
    (workflows) => workflows.length > 0,
  );

  const terminableWorkflows = derived(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.canBeTerminated),
  );

  const cancelableWorkflows = derived(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.status === 'Running'),
  );

  const openBatchCancelConfirmationModal = () => {
    $selectedWorkflows.length > 1
      ? (batchCancelConfirmationModalOpen = true)
      : (cancelConfirmationModalOpen = true);
  };

  const openBatchTerminateConfirmationModal = () => {
    $selectedWorkflows.length > 1
      ? (batchTerminateConfirmationModalOpen = true)
      : (terminateConfirmationModalOpen = true);
  };

  const handleSelectAll = (workflows: WorkflowExecution[]) => {
    allSelected.set(true);
    selectedWorkflows.set([...workflows]);
  };

  const handleSelectPage = (
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

  setContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT, {
    allSelected,
    pageSelected,
    terminableWorkflows,
    cancelableWorkflows,
    selectedWorkflows,
    batchActionsVisible,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
    handleSelectAll,
    handleSelectPage,
    query: batchOperationQuery,
  });

  $: {
    if ($updating) {
      resetSelection();
    }
  }
</script>

<BatchTerminateConfirmationModal
  {namespace}
  bind:open={batchTerminateConfirmationModalOpen}
/>

<BatchCancelConfirmationModal
  {namespace}
  bind:open={batchCancelConfirmationModalOpen}
/>

<TerminateConfirmationModal
  {refresh}
  {namespace}
  workflow={$selectedWorkflows[0]}
  bind:open={terminateConfirmationModalOpen}
/>

<CancelConfirmationModal
  {refresh}
  {namespace}
  workflow={$selectedWorkflows[0]}
  bind:open={cancelConfirmationModalOpen}
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
