<script lang="ts" module>
  import type { Readable, Writable } from 'svelte/store';

  import type { WorkflowExecution } from '$lib/types/workflows';

  export const BATCH_OPERATION_CONTEXT = 'BATCH_OPERATION_CONTEXT';

  export type BatchOperationContext = {
    allSelected: Writable<boolean>;
    terminableWorkflows: Readable<WorkflowExecution[]>;
    cancelableWorkflows: Readable<WorkflowExecution[]>;
    selectedWorkflows: Writable<WorkflowExecution[]>;
    batchActionsVisible: Readable<boolean>;
    openBatchCancelConfirmationModal: () => void;
    openBatchTerminateConfirmationModal: () => void;
    openBatchResetConfirmationModal: () => void;
    handleSelectAll: (workflows: WorkflowExecution[]) => void;
    selectWorkflows: (checked: boolean, workflows: WorkflowExecution[]) => void;
  };
</script>

<script lang="ts">
  import { derived as derivedStore } from 'svelte/store';

  import { onMount, setContext, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import BatchCancelConfirmationModal from '$lib/components/workflow/client-actions/batch-cancel-confirmation-modal.svelte';
  import BatchResetConfirmationModal from '$lib/components/workflow/client-actions/batch-reset-confirmation-modal.svelte';
  import BatchTerminateConfirmationModal from '$lib/components/workflow/client-actions/batch-terminate-confirmation-modal.svelte';
  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import FilterBar from '$lib/components/workflow/filter-bar/index.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { fetchWorkflowTaskFailures } from '$lib/services/workflow-counts';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { createBatchSelection } from '$lib/stores/batch-selection';
  import { availableWorkflowSystemSearchAttributeColumns } from '$lib/stores/configurable-table-columns';
  import { workflowFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import {
    DEFAULT_WORKFLOW_SYSTEM_VIEW,
    getSystemWorkflowViews,
    savedWorkflowQueries,
  } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    refresh,
    taskFailuresCount,
    workflowCount,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  const { headerActions, cloud }: { headerActions?: Snippet; cloud?: Snippet } =
    $props();

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace);
  const perPage = $derived(page.url.searchParams.get('per-page'));
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived($timestamp(refreshTime));

  const hasTaskFailureAttribute = $derived(
    !!page.data.namespace?.namespaceInfo?.capabilities
      ?.reportedProblemsSearchAttribute,
  );

  $effect(() => {
    void refreshTime;
    if (!hasTaskFailureAttribute) return;
    fetchWorkflowTaskFailures(namespace).then(
      (count) => ($taskFailuresCount = count ?? 0),
    );
  });

  const systemViews = $derived(
    getSystemWorkflowViews(hasTaskFailureAttribute, $taskFailuresCount),
  );

  const availableColumns = $derived(
    availableWorkflowSystemSearchAttributeColumns(
      namespace,
      page.data.settings,
    ),
  );

  onMount(() => {
    $lastUsedNamespace = page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = toListWorkflowFilters(query, $searchAttributes);
    }
  });

  $effect(() => {
    $workflowsQuery = query;
  });

  $effect(() => {
    $workflowsSearchParams = searchParams;
  });

  const {
    allSelected,
    selectedItems: selectedWorkflows,
    batchActionsVisible,
    selectItems: selectWorkflows,
    handleSelectAll,
    reset: resetSelection,
  } = createBatchSelection<WorkflowExecution>((workflow) => workflow.runId);

  $effect(() => {
    void namespace;
    void query;
    void perPage;
    void $refresh;
    resetSelection();
  });

  let customizationDrawerOpen = $state(false);

  let batchTerminateConfirmationModalOpen = $state(false);
  let batchCancelConfirmationModalOpen = $state(false);
  let batchResetConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);
  let cancelConfirmationModalOpen = $state(false);

  const workflowStartEnabled = $derived(!workflowCreateDisabled(page));

  const terminableWorkflows = derivedStore(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.canBeTerminated),
  );

  const cancelableWorkflows = derivedStore(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.status === 'Running'),
  );

  const openBatchCancelConfirmationModal = () => {
    if ($selectedWorkflows.length > 1) {
      batchCancelConfirmationModalOpen = true;
    } else {
      cancelConfirmationModalOpen = true;
    }
  };

  const openBatchTerminateConfirmationModal = () => {
    if ($selectedWorkflows.length > 1) {
      batchTerminateConfirmationModalOpen = true;
    } else {
      terminateConfirmationModalOpen = true;
    }
  };

  const openBatchResetConfirmationModal = () => {
    batchResetConfirmationModalOpen = true;
  };

  setContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT, {
    allSelected,
    terminableWorkflows,
    cancelableWorkflows,
    selectedWorkflows,
    batchActionsVisible,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
    openBatchResetConfirmationModal,
    handleSelectAll,
    selectWorkflows,
  });

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
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
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <div class="flex flex-row flex-wrap items-start gap-2">
          <h1
            class="flex items-center gap-2 leading-7"
            data-cy="workflows-title"
          >
            {#if $supportsAdvancedVisibility}
              <span
                role="status"
                aria-atomic="true"
                class="flex items-center gap-2"
              >
                <span data-testid="workflow-count"
                  >{$workflowCount.count.toLocaleString()}</span
                >
                <Translate
                  key="common.workflows-plural"
                  count={$workflowCount.count}
                />
              </span>
            {:else}
              <Translate key="workflows.recent-workflows" />
            {/if}
          </h1>
          <CountRefreshButton count={$workflowCount.newCount} {refresh} />
        </div>
        <p class="mt-2 text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
      <StatusCounts bind:refreshTime />
    </div>
    {#if headerActions || workflowStartEnabled}
      <div class="flex items-center gap-4">
        {@render headerActions?.()}
        {#if workflowStartEnabled}
          <Button href={routeForWorkflowStart({ namespace })}
            >{translate('workflows.start-workflow')}</Button
          >
        {/if}
      </div>
    {/if}
  </div>
</header>

<FilterBar />
<SavedQueryViews
  filters={workflowFilters}
  savedQueries={savedWorkflowQueries}
  {systemViews}
  defaultView={DEFAULT_WORKFLOW_SYSTEM_VIEW}
  {searchAttributes}
  id="workflow"
>
  <WorkflowsSummaryConfigurableTable
    onClickConfigure={openCustomizationDrawer}
    {cloud}
  />
</SavedQueryViews>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  type={translate('common.columns')}
  title={translate('common.workflows-table')}
/>
