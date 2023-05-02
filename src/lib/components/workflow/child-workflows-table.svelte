<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowExecution } from '$lib/types/workflows';
  import type { ChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import WorkflowStatus from '../workflow-status.svelte';
  import type { WorkflowExecutionStatus } from '$lib/types';

  export let children: ChildWorkflowClosedEvent[] = [];
  export let pendingChildren: WorkflowExecution['pendingChildren'] = [];
  export let namespace: string;

  type ChildWorkflowTableItem = {
    runId: string;
    workflowId: string;
    status: WorkflowExecutionStatus | string;
  };

  $: formattedPending = pendingChildren.map((c) => {
    return { runId: c.runId, workflowId: c.workflowId, status: 'Running' };
  });

  $: formattedCompleted = children.map((c) => {
    return {
      runId: c.attributes.workflowExecution.runId,
      workflowId: c.attributes.workflowExecution.workflowId,
      status: c.classification,
    };
  });

  $: formattedAll = [...formattedPending, ...formattedCompleted];
</script>

<Pagination
  items={formattedAll}
  itemsPerPage={10}
  let:visibleItems
  aria-label="child workflows"
>
  <div slot="pagination-top" />
  <Table class="w-full">
    <TableHeaderRow slot="headers">
      <th class="hidden md:block">Status</th>
      <th>Child Workflow ID</th>
      <th>Child Run ID</th>
    </TableHeaderRow>
    {#each visibleItems as child (child.runId)}
      <TableRow
        class="hover:text-blue-700 hover:underline"
        href={routeForEventHistory({
          namespace,
          workflow: child.workflowId,
          run: child.runId,
        })}
      >
        <td class="hidden md:block">
          <WorkflowStatus status={child.status} />
        </td>

        <td>
          {child.workflowId}
        </td>
        <td>
          {child.runId}
        </td>
      </TableRow>
    {/each}
  </Table>
</Pagination>
