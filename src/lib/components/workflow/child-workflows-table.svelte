<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowExecution } from '$lib/types/workflows';
  import type { ChildWorkflowExecutionCompletedEvent } from '$lib/types/events';

  export let children: ChildWorkflowExecutionCompletedEvent[] = [];
  export let pendingChildren: WorkflowExecution['pendingChildren'] = [];
  export let namespace: string;

  $: formattedPending = pendingChildren.map((c) => {
    return { runId: c.runId, workflowId: c.workflowId, status: 'Pending' };
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
  <Table class="w-full">
    <TableHeaderRow slot="headers">
      <th>Child Workflow ID</th>
      <th>Child Run ID</th>
      <th class="hidden md:block">Status</th>
    </TableHeaderRow>
    {#each visibleItems as child (child.runId)}
      <TableRow
        href={routeForEventHistory({
          namespace,
          workflow: child.workflowId,
          run: child.runId,
        })}
      >
        <td>
          {child.workflowId}
        </td>
        <td>
          {child.runId}
        </td>
        <td class="hidden md:block">
          {child.status}
        </td>
      </TableRow>
    {/each}
  </Table>
</Pagination>
