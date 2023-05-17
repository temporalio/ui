<script lang="ts">
  import {
    routeForEventHistory,
    routeForSchedule,
  } from '$lib/utilities/route-for';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import type { WorkflowIdentifier } from '$lib/types/workflows';
  import Copyable from '../copyable.svelte';
  import { goto } from '$app/navigation';
  import Link from '$lib/holocene/link.svelte';

  export let scheduleId: string;
  export let namespace: string;
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th>Schedule</th>
  </TableHeaderRow>
  <TableRow class="hover:text-blue-700 hover:underline">
    <td>
      <Link
        newTab
        href={routeForSchedule({
          namespace: namespace,
          scheduleId,
        })}
      >
        <Copyable content={scheduleId} visible />
      </Link>
    </td>
  </TableRow>
</Table>
