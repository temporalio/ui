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
    openBatchCancelConfirmationModal: () => void;
    openBatchTerminateConfirmationModal: () => void;
    openBatchResetConfirmationModal: () => void;
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
  import BatchResetConfirmationModal from '$lib/components/workflow/client-actions/batch-reset-confirmation-modal.svelte';
  import BatchTerminateConfirmationModal from '$lib/components/workflow/client-actions/batch-terminate-confirmation-modal.svelte';
  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  // import WorkflowSearchAttributeFilter from '$lib/components/workflow/search-attribute-filter/index.svelte';
  import WorkflowCountRefresh from '$lib/components/workflow/workflow-count-refresh.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import Button from '$lib/holocene/button.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { availableWorkflowSystemSearchAttributeColumns } from '$lib/stores/configurable-table-columns';
  import { workflowFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { currentPageKey } from '$lib/stores/pagination';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    queryWithParentWorkflowId,
    refresh,
    workflowCount,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  $: query = $page.url.searchParams.get('query');
  $: query, ($workflowsQuery = query);
  $: namespace = $page.params.namespace;
  $: perPage = $page.url.searchParams.get('per-page');

  // For returning to page from 'Back to Workflows' with previous search
  $: searchParams = $page.url.searchParams.toString();
  $: searchParams, ($workflowsSearchParams = searchParams);

  $: availableColumns = availableWorkflowSystemSearchAttributeColumns(
    namespace,
    $page.data.settings,
  );

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
  let batchResetConfirmationModalOpen = false;
  let terminateConfirmationModalOpen = false;
  let cancelConfirmationModalOpen = false;
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

  const openBatchResetConfirmationModal = () => {
    batchResetConfirmationModalOpen = true;
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
    openBatchResetConfirmationModal,
    handleSelectAll,
    handleSelectPage,
  });

  $: namespace, $queryWithParentWorkflowId, perPage, $refresh, resetSelection();

  let customizationDrawerOpen = false;

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const setTab = (_query: string) => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: _query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };
</script>

<BatchTerminateConfirmationModal
  {namespace}
  bind:open={batchTerminateConfirmationModalOpen}
/>

<BatchCancelConfirmationModal
  {namespace}
  bind:open={batchCancelConfirmationModalOpen}
/>

<BatchResetConfirmationModal
  {namespace}
  bind:open={batchResetConfirmationModalOpen}
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
  <div class="flex flex-col justify-between gap-2 md:flex-row">
    <h1 class="flex items-center gap-2" data-cy="workflows-title">
      {#if $supportsAdvancedVisibility}
        <span data-testid="workflow-count"
          >{$workflowCount.count.toLocaleString()}</span
        >
        <Translate key="common.workflows-plural" count={$workflowCount.count} />
      {:else}
        <Translate key="workflows.recent-workflows" />
      {/if}
      <WorkflowCountRefresh count={$workflowCount.newCount} />
    </h1>
    {#if !workflowCreateDisabled($page)}
      <Button
        leadingIcon="lightning-bolt"
        href={routeForWorkflowStart({ namespace })}
        >{translate('workflows.start-workflow')}</Button
      >
    {/if}
  </div>
  <WorkflowCounts />
</header>

<!-- <WorkflowSearchAttributeFilter /> -->
<div>
  <TabButtons>
    <TabButton
      icon="bookmark"
      data-testid="all"
      class="h-10"
      active={query === ''}
      on:click={() => setTab('')}>All</TabButton
    >
    <TabButton
      data-testid="running"
      class="h-10"
      active={query === "StartTime >= '2025-08-19T05:00:00.000Z'"}
      on:click={() => setTab("StartTime >= '2025-08-19T05:00:00.000Z'")}
      >Today</TabButton
    >
    <TabButton
      data-testid="running"
      class="h-10"
      active={query === 'ExecutionStatus = "Running"'}
      on:click={() => setTab('ExecutionStatus = "Running"')}>Running</TabButton
    >
    <TabButton
      data-testid="failed"
      class="h-10"
      active={query === 'ExecutionStatus = "Failed"'}
      on:click={() => setTab('ExecutionStatus = "Failed"')}>Failed</TabButton
    >
    <TabButton
      data-testid="running"
      class="h-10"
      active={query === 'CustomKeywordField = "Kittens"'}
      on:click={() => setTab('CustomKeywordField = "Kittens"')}
      >Silly Kittens in the last 24 Hours</TabButton
    >
  </TabButtons>
  <WorkflowsSummaryConfigurableTable onClickConfigure={openCustomizationDrawer}>
    <slot name="cloud" slot="cloud" />
  </WorkflowsSummaryConfigurableTable>
</div>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  type={translate('common.columns')}
  title={translate('common.workflows-table')}
/>
