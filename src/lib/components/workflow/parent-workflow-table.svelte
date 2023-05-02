<script lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import Copyable from '../copyable.svelte';
  import { goto } from '$app/navigation';
  import Link from '$lib/holocene/link.svelte';

  export let parent: WorkflowIdentifier;
  export let namespace: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>Parent Workflow ID</th>
    <th>Parent Run ID</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        href={routeForEventHistory({
          namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable content={parent.workflowId} visible />
      </Link>
    </td>
    <td>
      <Link
        href={routeForEventHistory({
          namespace,
          workflow: parent.workflowId,
          run: parent.runId,
        })}
      >
        <Copyable content={parent.runId} visible />
      </Link>
    </td>
  </TableRow>
</Table>
