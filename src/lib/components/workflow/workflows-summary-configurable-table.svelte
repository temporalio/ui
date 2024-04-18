<script lang="ts">
  import { page } from '$app/stores';

  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllWorkflows } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { temporalVersion } from '$lib/stores/versions';
  import { workflowTableColumns } from '$lib/stores/workflow-table-columns';
  import { updating, workflows } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  import GraphWidget from '../lines-and-dots/svg/graph-widget.svelte';

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
  let timelineIds: { workflowId: string; runId: string }[] = [];

  async function fetchAllChildWorkflows(
    namespace: string,
    workflowId: string,
  ): Promise<WorkflowExecution[]> {
    const canFetchLiveChildren =
      $isCloud || minimumVersionRequired('1.23', $temporalVersion);
    if (!canFetchLiveChildren) {
      return [];
    }
    try {
      const { workflows } = await fetchAllWorkflows(namespace, {
        query: `ParentWorkflowId = "${workflowId}"`,
      });
      return workflows;
    } catch (e) {
      return [];
    }
  }

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

  const viewHistory = (workflow: WorkflowExecution) => {
    if (timelineActive(workflow)) {
      timelineIds = timelineIds.filter(
        (id) => id.workflowId !== workflow.id && id.runId !== workflow.runId,
      );
    } else {
      timelineIds = [
        { workflowId: workflow.id, runId: workflow.runId },
        ...timelineIds,
      ];
    }
  };

  $: childrenActive = (workflow: WorkflowExecution) => {
    return childrenIds.find(
      (id) => id.workflowId === workflow.id && id.runId === workflow.runId,
    );
  };

  $: timelineActive = (workflow: WorkflowExecution) => {
    return timelineIds.some(
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
      {viewHistory}
      timelineActive={timelineActive(workflow)}
      childActive={!!childrenActive(workflow)}
    >
      {#each columns as column}
        <TableBodyCell {workflow} {column} />
      {/each}
    </TableRow>
    {#if timelineActive(workflow)}
      <tr>
        <td colspan={columns.length + 2} class="bg-black">
          <GraphWidget
            workflowId={workflow.id}
            runId={workflow.runId}
            {namespace}
            height={200}
            width={1600}
          />
        </td>
      </tr>
    {/if}
    {#if childrenActive(workflow)}
      {#each childrenActive(workflow).children as child}
        <TableRow
          workflow={child}
          child
          {viewHistory}
          timelineActive={timelineActive(child)}
        >
          {#each columns as column}
            <TableBodyCell workflow={child} {column} />
          {/each}
        </TableRow>
        {#if timelineActive(child)}
          <tr>
            <td colspan={columns.length + 2} class="bg-black">
              <GraphWidget
                workflowId={child.id}
                runId={child.runId}
                {namespace}
                height={200}
                width={1600}
              />
            </td>
          </tr>
        {/if}
      {/each}
    {/if}
  {/each}
  <slot name="cloud" slot="cloud" />
</PaginatedTable>
