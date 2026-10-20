<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  import { getContext, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import DownloadJsonButton from '$lib/components/download-json-button.svelte';
  import ResetColumnWidthsButton from '$lib/components/table/reset-column-widths-button.svelte';
  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import FeatureTag from '$lib/holocene/feature-tag.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconTable,
    IconTableDense,
    IconTemporalSettings,
  } from '$lib/io/icon';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { createTableSort } from '$lib/runes/table-sort-state.svelte';
  import {
    fetchAllChildWorkflows,
    fetchPaginatedWorkflows,
  } from '$lib/services/workflow-service';
  import {
    configurableTableColumns,
    resizeColumn,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { viewFeature } from '$lib/stores/new-feature-tags';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { tableDensity } from '$lib/stores/table-density';
  import { refresh, workflowCount } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    getBatchSelectionTargets,
    getPageSelectionStatus,
    type PageSelectionStatus,
  } from '$lib/utilities/batch-selection';

  import { getWorkflowSortColumns } from './workflows-summary-configurable-table/column-search-attributes';
  import {
    createVisibleRows,
    type VisibleRow,
  } from './workflows-summary-configurable-table/visible-rows';

  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';

  interface Props {
    onClickConfigure: () => void;
    cloud?: Snippet;
  }

  let { onClickConfigure, cloud }: Props = $props();

  const { allSelected, selectedWorkflows, selectWorkflows } =
    getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  const namespace = $derived(page.params.namespace);
  const baseColumns = $derived(
    $configurableTableColumns?.[namespace]?.workflows ?? [],
  );
  const query = $derived(page.url.searchParams.get('query') ?? '');

  const tableSort = createTableSort(() => [namespace, query]);

  const hasVersioningFilter = $derived(
    query?.includes('TemporalWorkerDeploymentVersion') ?? false,
  );
  const hasVersioningBehaviorColumn = $derived(
    baseColumns.some((col) => col.label === 'Versioning Behavior'),
  );
  const columns = $derived(
    hasVersioningFilter && !hasVersioningBehaviorColumn
      ? [...baseColumns, { label: 'Versioning Behavior' }]
      : baseColumns,
  );

  const visibleChildrenMap = new SvelteMap<string, WorkflowExecution[]>();

  $effect(() => {
    void $refresh;
    void query;
    visibleChildrenMap.clear();
    inFlightChildRequests.clear();
  });

  const inFlightChildRequests = new SvelteSet<string>();
  const toggleChildrenVisibility = async (workflow: WorkflowExecution) => {
    const visibleChildren = visibleChildrenMap.get(workflow.runId);

    if (visibleChildren?.length != null) {
      // we are collapsing the children so if there is an inflight request
      // we don't want its resolution to reopen the children.
      inFlightChildRequests.delete(workflow.runId);

      visibleChildrenMap.delete(workflow.runId);
      // deselect children when collapsing
      selectWorkflows(false, visibleChildren);

      // clear prevClickedRow if row is collapsing
      if (
        prevClickedRow?.rowType === 'child' &&
        prevClickedRow.parentRow.value.runId === workflow.runId
      ) {
        prevClickedRow = prevClickedRow.parentRow;
      }

      return;
    }

    if (inFlightChildRequests.has(workflow.runId)) return;

    inFlightChildRequests.add(workflow.runId);
    try {
      const children = await fetchAllChildWorkflows(
        namespace,
        workflow.id,
        workflow.runId,
      );

      if (inFlightChildRequests.has(workflow.runId)) {
        visibleChildrenMap.set(workflow.runId, children);
      }
    } finally {
      inFlightChildRequests.delete(workflow.runId);
    }
  };

  const onFetch = $derived(() => fetchPaginatedWorkflows(namespace, query));

  const dense = $derived($tableDensity === 'dense');

  const setTableDensity = () => {
    $tableDensity = dense ? 'comfortable' : 'dense';
    viewFeature('tableDensity');
  };

  // Pages are replaced, never mutated here. Preserve row identities when sorting
  // so unchanged cells do not recompute through a fresh set of deep proxies.
  let visiblePaginatedItems: WorkflowExecution[] = $state.raw([]);

  const getVisibleRows = createVisibleRows();
  const visibleRows = $derived(
    getVisibleRows(visiblePaginatedItems, visibleChildrenMap),
  );

  let prevClickedRow = $state<VisibleRow | null>(null);

  const pageSelectionStatus: PageSelectionStatus = $derived(
    getPageSelectionStatus(
      visiblePaginatedItems.map((i) => i.runId),
      new Set($selectedWorkflows.map((w) => w.runId)),
      $allSelected,
    ),
  );

  const handleSelectPage = (
    isSelected: boolean,
    workflows: WorkflowExecution[],
  ) => {
    selectWorkflows(isSelected, workflows);
    prevClickedRow = null;

    if (!isSelected) {
      allSelected.set(false);
    }
  };

  const handleBatchSelect = (
    event: MouseEvent,
    row: VisibleRow,
    visibleRowIndex: number,
  ) => {
    // child rows are inserted and removed dynamically, so re-derive the index
    // of the previously clicked row by runId rather than caching a number.
    const prevClickedRowIndex = visibleRows.findIndex(
      (r) => r.value.runId === prevClickedRow?.value.runId,
    );

    const selection = getBatchSelectionTargets(
      event,
      visibleRows,
      visibleRowIndex,
      prevClickedRowIndex,
    );
    if (!selection) return;

    selectWorkflows(
      selection.isChecked,
      selection.targeted.map((r) => r.value),
    );
    prevClickedRow = row;
  };

  $effect(() => {
    void visiblePaginatedItems;
    void $allSelected;
    prevClickedRow = null;
  });
  const sortColumns = $derived(
    getWorkflowSortColumns(
      columns.map((column) => column.label),
      $searchAttributes,
    ),
  );
</script>

{#key [namespace, query, $refresh]}
  <PaginatedTable
    total={$workflowCount.count}
    bind:sort={tableSort.value}
    {sortColumns}
    {onFetch}
    onItemsChange={(items) => {
      visiblePaginatedItems = items;
    }}
    aria-label={translate('common.workflows')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('workflows.empty-state-title')}
  >
    {#snippet caption()}
      <caption class="sr-only">
        {translate('common.workflows')}
      </caption>
    {/snippet}
    {#snippet headers()}
      <TableHeaderRow
        columnsCount={columns.length}
        empty={visiblePaginatedItems.length === 0}
        workflows={visiblePaginatedItems}
        {pageSelectionStatus}
        onSelectPage={handleSelectPage}
      >
        {#each columns as column (column.label)}
          <TableHeaderCell
            {column}
            onResize={baseColumns.some((c) => c.label === column.label)
              ? (width) =>
                  resizeColumn(
                    column.label,
                    width,
                    namespace,
                    TABLE_TYPE.WORKFLOWS,
                  )
              : undefined}
          />
        {/each}
      </TableHeaderRow>
    {/snippet}
    {#snippet rows()}
      {#each visibleRows as row, visibleRowIndex (row.value.runId)}
        {@const workflow = row.value}
        {@const isChildRow = row.rowType === 'child'}
        <TableRow
          {workflow}
          {toggleChildrenVisibility}
          childCount={!isChildRow && row.childCount != null
            ? row.childCount
            : undefined}
          child={isChildRow}
          onClickBatchSelect={(event) =>
            handleBatchSelect(event, row, visibleRowIndex)}
        >
          {#each columns as column (column.label)}
            <TableBodyCell {workflow} {column} truncate={dense} />
          {/each}
        </TableRow>
      {/each}
    {/snippet}
    {#snippet empty()}
      <TableEmptyState {cloud} />
    {/snippet}
    {#snippet actionsEndAdditional({ visibleItems, page })}
      <Tooltip
        text={dense
          ? translate('common.dense')
          : translate('common.comfortable')}
        top
      >
        <FeatureTag feature="tableDensity" />
        <Button
          onclick={setTableDensity}
          data-testid="table-density-button"
          size="xs"
          variant="ghost"
          LeadingIcon={dense ? IconTableDense : IconTable}
          aria-label={dense
            ? translate('common.dense')
            : translate('common.comfortable')}
          data-track-name="density-table-control"
          data-track-intent="action"
          data-track-text={dense
            ? translate('common.dense')
            : translate('common.comfortable')}
        ></Button>
      </Tooltip>
      <ResetColumnWidthsButton
        columns={baseColumns}
        {namespace}
        table={TABLE_TYPE.WORKFLOWS}
      />
      <DownloadJsonButton
        items={visibleItems}
        {page}
        filePrefix="workflows"
        testId="export-history-button"
      />
      <Tooltip text={translate('common.configure-columns')} top>
        <Button
          onclick={onClickConfigure}
          data-testid="workflows-summary-table-configuration-button"
          size="xs"
          variant="ghost"
          aria-label={translate('common.configure-columns')}
          data-track-name="workflows-table-control"
          data-track-intent="configure-columns"
          data-track-text={translate('common.configure-columns')}
        >
          <IconTemporalSettings />
        </Button>
      </Tooltip>
    {/snippet}
  </PaginatedTable>
{/key}
