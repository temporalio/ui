<script lang="ts">
  import { page } from '$app/stores';

  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllChildWorkflows } from '$lib/services/workflow-service';
  import { showChildWorkflows } from '$lib/stores/filters';
  import { workflowTableColumns } from '$lib/stores/workflow-table-columns';
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
  $: columns = $workflowTableColumns?.[namespace] ?? [];
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
      const children = await fetchAllChildWorkflows(namespace, workflow.id);
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
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  updating={$updating}
  items={$workflows}
  let:visibleItems
>
  <caption class="sr-only" slot="caption">
    {translate('common.workflows')}
  </caption>
  <TableHeaderRow
    columnsCount={columns.length}
    {empty}
    slot="headers"
    let:visibleItems
    workflows={visibleItems}
  >
    {#each columns as column}
      <TableHeaderCell {column} />
    {/each}
  </TableHeaderRow>
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
  <slot name="cloud" slot="cloud" />
</PaginatedTable>
