<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  export let children: ChildWorkflowExecutionCompletedEvent[] = [];
  import type { WorkflowExecution } from '$lib/types/workflows';
</script>

<Pagination
  items={children}
  itemsPerPage={10}
  let:visibleItems
  aria-label="child workflows"
>
  <h3 slot="action-top-left">Completed Children</h3>
  <Table class="w-full">
    <TableHeaderRow slot="headers">
      <th>Child Workflow ID</th>
      <th>Child Run ID</th>
    </TableHeaderRow>
    {#each visibleItems as child (child.id)}
      <TableRow
        href={routeForEventHistory({
          namespace: child.attributes.namespace,
          workflow: child.attributes.workflowExecution.workflowId,
          run: child.attributes.workflowExecution.runId,
        })}
      >
        <td>
          {child.attributes.workflowExecution.workflowId}
        </td>
        <td>
          {child.attributes.workflowExecution.runId}
        </td>
      </TableRow>
    {/each}
  </Table>
</Pagination>
