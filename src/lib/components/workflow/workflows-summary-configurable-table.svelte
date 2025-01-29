<script lang="ts">
  import { page } from '$app/stores';

  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllChildWorkflows } from '$lib/services/workflow-service';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';
  import { showChildWorkflows } from '$lib/stores/filters';
  import {
    refresh,
    updating,
    workflows,
    workflowsQuery,
  } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';

  $: ({ namespace } = $page.params);
  $: columns = $configurableTableColumns?.[namespace]?.workflows ?? [];
  $: empty = $workflows.length === 0;

  let childrenIds: {
    workflowId: string;
    runId: string;
    children: WorkflowExecution[];
  }[] = [];

  const clearChildren = () => {
    childrenIds = [];
  };

  $: $showChildWorkflows, $refresh, $workflowsQuery, clearChildren();

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

  $: childrenActive = (workflow: WorkflowExecution) => {
    return childrenIds.find(
      (id) => id.workflowId === workflow.id && id.runId === workflow.runId,
    );
  };
</script>

<PaginatedTable
  aria-label={translate('common.workflows')}
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  updating={$updating}
  items={$workflows}
>
  {#snippet caption()}
    <caption class="sr-only" slot="caption">
      {translate('common.workflows')}
    </caption>
  {/snippet}
  {#snippet header({ visibleItems })}
    <TableHeaderRow
      columnsCount={columns.length}
      {empty}
      workflows={visibleItems}
    >
      {#each columns as column}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as workflow}
      <TableRow
        {workflow}
        {viewChildren}
        childCount={childrenActive(workflow)?.children.length}
      >
        {#each columns as column}
          <TableBodyCell {workflow} {column} />
        {/each}
      </TableRow>
      {#if childrenActive(workflow)}
        {#each childrenActive(workflow).children as child}
          <TableRow workflow={child} child>
            {#each columns as column}
              <TableBodyCell workflow={child} {column} />
            {/each}
          </TableRow>
        {/each}
      {/if}
    {/each}
  {/snippet}
  {#snippet emptyState()}
    <TableEmptyState updating={$updating}>
      <slot name="cloud" slot="cloud" />
    </TableEmptyState>
  {/snippet}
</PaginatedTable>
