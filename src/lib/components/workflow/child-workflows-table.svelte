<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  export let pendingChildren: WorkflowExecution['pendingChildren'] = [];
  export let namespace: string;
</script>

<Pagination
  items={pendingChildren}
  itemsPerPage={10}
  let:visibleItems
  ariaLabel="child workflows"
>
  <Table class="w-full">
    <TableHeaderRow slot="headers">
      <th class="md:table-cell">Child Workflow ID</th>
      <th class="md:table-cell">Child Run ID</th>
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
      </TableRow>
    {/each}
  </Table>
</Pagination>
