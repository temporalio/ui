<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import WorkflowStatus from '../workflow-status.svelte';
  import type { WorkflowExecutionStatus } from '$lib/types';
  import Copyable from '../copyable.svelte';

  export let parent: WorkflowIdentifier;
  export let namespace: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>Parent Workflow ID</th>
    <th>Parent Run ID</th>
  </TableHeaderRow>
  <TableRow
    class="hover:text-blue-700 hover:underline"
    href={routeForEventHistory({
      namespace,
      workflow: parent.workflowId,
      run: parent.runId,
    })}
  >
    <td>
      <Copyable content={parent.workflowId} visible />
    </td>
    <td>
      <Copyable content={parent.runId} visible />
    </td>
  </TableRow>
</Table>
