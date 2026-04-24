<script lang="ts">
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

  const { selectWorkflows } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  const namespace = $derived(page.params.namespace);
  const baseColumns = $derived(
    $configurableTableColumns?.[namespace]?.workflows ?? [],
  );
  const query = $derived(page.url.searchParams.get('query'));

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

  let childrenIds = $state<
    {
      workflowId: string;
      runId: string;
      children: WorkflowExecution[];
    }[]
  >([]);

  const clearChildren = () => {
    childrenIds = [];
  };

  $effect(() => {
    void $refresh;
    void query;
    clearChildren();
  });

  const viewChildren = async (workflow: WorkflowExecution) => {
    if (childrenActive(workflow)) {
      childrenIds = childrenIds.filter(
        (id) => id.workflowId !== workflow.id && id.runId !== workflow.runId,
      );
    } else {
      const children = await fetchAllChildWorkflows(
        namespace,
        workflow.id,
        workflow.runId,
      );
      childrenIds = [
        { workflowId: workflow.id, runId: workflow.runId, children },
        ...childrenIds,
      ];
    }
  };

  const childrenActive = (workflow: WorkflowExecution) => {
    return childrenIds.find(
      (id) => id.workflowId === workflow.id && id.runId === workflow.runId,
    );
  };

  const onFetch = $derived(() => fetchPaginatedWorkflows(namespace, query));

  const dense = $derived($tableDensity === 'dense');

  const setTableDensity = () => {
    $tableDensity = dense ? 'comfortable' : 'dense';
    viewFeature('tableDensity');
  };

  let visibleItems: WorkflowExecution[] = $state([]);
  let prevVisibleItemBatchSelectClickIndex = $state<null | number>(null);
  $effect(() => {
    void visibleItems;
    prevVisibleItemBatchSelectClickIndex = null;
  });
</script>

{#key [namespace, query, $refresh]}
  <PaginatedTable
    total={$workflowCount.count}
    {onFetch}
    onItemsChange={(items) => {
      visibleItems = items;
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
      empty={visibleItems.length === 0}
      slot="headers"
      workflows={visibleItems}
    >
      {#each columns as column (column)}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleItems as workflow, visibleItemIndex (`${workflow.id}:${workflow.runId}`)}
      <TableRow
        {workflow}
        {viewChildren}
        onClickBatchSelect={(e) => {
          let targetedWorkflows = [workflow];

          if (e.shiftKey && prevVisibleItemBatchSelectClickIndex != null) {
            const rangeStartInclusive = Math.min(
              prevVisibleItemBatchSelectClickIndex,
              visibleItemIndex,
            );
            const rangeEndInclusive = Math.max(
              prevVisibleItemBatchSelectClickIndex,
              visibleItemIndex,
            );

            // end of the slice range is exclusive, so add 1 to include the full range
            targetedWorkflows = visibleItems.slice(
              rangeStartInclusive,
              rangeEndInclusive + 1,
            );
          }

          selectWorkflows(e.currentTarget.checked, targetedWorkflows);
          prevVisibleItemBatchSelectClickIndex = visibleItemIndex;
        }}
        childCount={childrenActive(workflow)?.children.length}
      >
        {#each columns as column (column)}
          <TableBodyCell {workflow} {column} truncate={dense} />
        {/each}
      </TableRow>
      {#if childrenActive(workflow)}
        {#each childrenActive(workflow).children as child (`${child.id}:${child.runId}`)}
          <TableRow workflow={child} child>
            {#each columns as column (column)}
              <TableBodyCell workflow={child} {column} truncate={dense} />
            {/each}
          </TableRow>
        {/each}
      {/if}
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
