<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { eventViewType } from '$lib/stores/event-view';

  import Pagination from '$lib/holocene/pagination.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  export let pendingChildren: WorkflowExecution['pendingChildren'] = [];
  export let namespace: string;

  console.log(pendingChildren);
</script>

<Pagination items={pendingChildren} itemsPerPage={10} let:visibleItems>
  <Table class="w-full">
    <TableHeaderRow slot="headers">
      <th class="md:table-cell">Child Workflow</th>
      <th class="md:table-cell">Child ID</th>
    </TableHeaderRow>
    {#each visibleItems as child (child.runId)}
      <TableRow
        href={routeForEventHistory({
          namespace,
          workflow: child.workflowId,
          run: child.runId,
          view: $eventViewType,
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
