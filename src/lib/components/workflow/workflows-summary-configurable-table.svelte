<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  import { getContext, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import FeatureTag from '$lib/holocene/feature-tag.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import {
    fetchAllChildWorkflows,
    fetchPaginatedWorkflows,
  } from '$lib/services/workflow-service';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';
  import { viewFeature } from '$lib/stores/new-feature-tags';
  import { tableDensity } from '$lib/stores/table-density';
  import { refresh, workflowCount } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';

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

    if (visibleChildren?.length) {
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

  let visiblePaginatedItems: WorkflowExecution[] = $state([]);

  type VisibleRow =
    | {
        rowType: 'root';
        childCount: number;
        value: WorkflowExecution;
      }
    | {
        rowType: 'child';
        parentRow: Extract<VisibleRow, { rowType: 'root' }>;
        value: WorkflowExecution;
      };
  const visibleRows: VisibleRow[] = $derived.by(() => {
    return visiblePaginatedItems.flatMap((workflow) => {
      const visibleChildren = visibleChildrenMap.get(workflow.runId) ?? [];

      const rootRow = {
        rowType: 'root' as const,
        childCount: visibleChildren.length,
        value: workflow,
      };

      return [
        rootRow,
        ...visibleChildren.map((c) => ({
          rowType: 'child' as const,
          parentRow: rootRow,
          value: c,
        })),
      ];
    });
  });

  let prevClickedRow = $state<VisibleRow | null>(null);

  type PageSelectionStatus = 'checked' | 'unchecked' | 'partial';

  const pageSelectionStatus: PageSelectionStatus = $derived.by(() => {
    const selectedRunIdSet = new Set($selectedWorkflows.map((w) => w.runId));

    if ($allSelected) {
      return 'checked';
    }

    const visibleItemsNotSelected = visiblePaginatedItems.filter(
      (i) => !selectedRunIdSet.has(i.runId),
    );

    if (visibleItemsNotSelected.length === visiblePaginatedItems.length) {
      return 'unchecked';
    }

    if (visibleItemsNotSelected.length === 0) {
      return 'checked';
    }

    return 'partial';
  });

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

  $effect(() => {
    void visiblePaginatedItems;
    void $allSelected;
    prevClickedRow = null;
  });
</script>

{#key [namespace, query, $refresh]}
  <PaginatedTable
    total={$workflowCount.count}
    {onFetch}
    onItemsChange={(items) => {
      visiblePaginatedItems = items;
    }}
    aria-label={translate('common.workflows')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('workflows.empty-state-title')}
    maxHeight="var(--panel-h)"
  >
    <caption class="sr-only" slot="caption">
      {translate('common.workflows')}
    </caption>
    <TableHeaderRow
      columnsCount={columns.length}
      empty={visiblePaginatedItems.length === 0}
      slot="headers"
      workflows={visiblePaginatedItems}
      {pageSelectionStatus}
      onSelectPage={handleSelectPage}
    >
      {#each columns as column (column)}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleRows as row, visibleRowIndex (row.value.runId)}
      {@const isChildRow = row.rowType === 'child'}
      <TableRow
        workflow={row.value}
        {toggleChildrenVisibility}
        childCount={!isChildRow && row.childCount > 0
          ? row.childCount
          : undefined}
        child={isChildRow}
        onClickBatchSelect={(event) => {
          // this is required due to how the underlying Checkbox component
          // gets its onclick type from svelte event forwarding. It does not
          // know what the current event target type is a checkbox input
          if (!(event.currentTarget instanceof HTMLInputElement)) {
            return;
          }

          const isChecked = event.currentTarget.checked;

          let targetedWorkflows = [row.value];

          const prevClickedRowIndex = visibleRows.findIndex(
            (r) => r.value.runId === prevClickedRow?.value.runId,
          );

          if (event.shiftKey && prevClickedRowIndex >= 0) {
            const rangeStartInclusive = Math.min(
              prevClickedRowIndex,
              visibleRowIndex,
            );
            const rangeEndInclusive = Math.max(
              prevClickedRowIndex,
              visibleRowIndex,
            );

            // end of the slice range is exclusive, so add 1 to include the full range
            targetedWorkflows = visibleRows
              .slice(rangeStartInclusive, rangeEndInclusive + 1)
              .map((r) => r.value);
          }

          selectWorkflows(isChecked, targetedWorkflows);

          prevClickedRow = row;
        }}
      >
        {#each columns as column (column)}
          <TableBodyCell workflow={row.value} {column} truncate={dense} />
        {/each}
      </TableRow>
    {/each}
    <svelte:fragment slot="empty">
      <TableEmptyState {cloud} />
    </svelte:fragment>
    <svelte:fragment slot="actions-end-additional" let:visibleItems let:page>
      <Tooltip
        text={dense
          ? translate('common.dense')
          : translate('common.comfortable')}
        top
      >
        <FeatureTag feature="tableDensity" alpha />
        <Button
          on:click={setTableDensity}
          data-testid="table-density-button"
          size="xs"
          variant="ghost"
          leadingIcon={dense ? 'table-dense' : 'table-comfy'}
        ></Button>
      </Tooltip>
      <Tooltip text={translate('common.download-json')} top>
        <Button
          on:click={() => exportWorkflows(visibleItems, page)}
          data-testid="export-history-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="download" />
        </Button>
      </Tooltip>
      <Tooltip text="Configure Columns" top>
        <Button
          on:click={onClickConfigure}
          data-testid="workflows-summary-table-configuration-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="settings" />
        </Button>
      </Tooltip>
    </svelte:fragment>
  </PaginatedTable>
{/key}
