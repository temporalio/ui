<script lang="ts" module>
  import type { Readable, Writable } from 'svelte/store';

  import { twMerge as merge } from 'tailwind-merge';

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
  import { derived as derivedStore, writable } from 'svelte/store';

  import { onMount, setContext } from 'svelte';

  import { page } from '$app/state';

  import BatchCancelConfirmationModal from '$lib/components/workflow/client-actions/batch-cancel-confirmation-modal.svelte';
  import BatchResetConfirmationModal from '$lib/components/workflow/client-actions/batch-reset-confirmation-modal.svelte';
  import BatchTerminateConfirmationModal from '$lib/components/workflow/client-actions/batch-terminate-confirmation-modal.svelte';
  import CancelConfirmationModal from '$lib/components/workflow/client-actions/cancel-confirmation-modal.svelte';
  import TerminateConfirmationModal from '$lib/components/workflow/client-actions/terminate-confirmation-modal.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import FilterBar from '$lib/components/workflow/filter-bar/index.svelte';
  import WorkflowCountRefresh from '$lib/components/workflow/workflow-count-refresh.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import SavedQueryViews from '$lib/pages/saved-query-views.svelte';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { availableWorkflowSystemSearchAttributeColumns } from '$lib/stores/configurable-table-columns';
  import { workflowFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import {
    refresh,
    workflowCount,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  const query = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace);
  const perPage = $derived(page.url.searchParams.get('per-page'));
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived(
    formatDate(refreshTime, $timeFormat, {
      relative: $relativeTime,
      format: $timestampFormat,
    }),
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

  $effect(() => {
    namespace;
    query;
    perPage;
    $refresh;
    resetSelection();
  });

  const resetSelection = () => {
    $allSelected = false;
    $pageSelected = false;
    $selectedWorkflows = [];
  };

  let customizationDrawerOpen = $state(false);

  let batchTerminateConfirmationModalOpen = $state(false);
  let batchCancelConfirmationModalOpen = $state(false);
  let batchResetConfirmationModalOpen = $state(false);
  let terminateConfirmationModalOpen = $state(false);
  let cancelConfirmationModalOpen = $state(false);

  const allSelected = writable<boolean>(false);
  const pageSelected = writable<boolean>(false);
  const selectedWorkflows = writable<WorkflowExecution[]>([]);
  const batchActionsVisible = derivedStore(
    selectedWorkflows,
    (workflows) => workflows.length > 0,
  );
  const workflowStartEnabled = $derived(!workflowCreateDisabled(page));

  const terminableWorkflows = derivedStore(selectedWorkflows, (workflows) =>
    workflows.filter((workflow) => workflow.canBeTerminated),
  );

  const cancelableWorkflows = derivedStore(selectedWorkflows, (workflows) =>
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
    <div class="flex flex-col gap-2">
      <div class="flex flex-row items-center gap-1">
        <h1 class="flex items-center gap-2 leading-7" data-cy="workflows-title">
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
        </h1>
        <WorkflowCountRefresh count={$workflowCount.newCount} />
        <WorkflowCounts bind:refreshTime />
      </div>
      <p class="text-xs text-secondary">
        {refreshTimeFormatted}
      </p>
    </div>
    {#if $$slots['header-actions'] || workflowStartEnabled}
      <div class="flex items-center gap-4">
        <slot name="header-actions" />
        {#if workflowStartEnabled}
          <Button
            leadingIcon="lightning-bolt"
            href={routeForWorkflowStart({ namespace })}
            >{translate('workflows.start-workflow')}</Button
          >
        {/if}
      </div>
    {/if}
  </div>
</header>

<FilterBar />
<div class="flex overflow-auto">
  <SavedQueryViews />
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
    )}
  >
    <WorkflowsSummaryConfigurableTable
      onClickConfigure={openCustomizationDrawer}
    >
      <slot name="cloud" slot="cloud" />
    </WorkflowsSummaryConfigurableTable>
  </div>
</div>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  type={translate('common.columns')}
  title={translate('common.workflows-table')}
/>
