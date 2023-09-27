<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import type { BatchOperationInfo } from '$lib/types';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForBatchOperation } from '$lib/utilities/route-for';

  export let operations: BatchOperationInfo[];
  export let namespace: string;

  const jobStateToBadgeType = {
    Completed: 'green',
    Running: 'blue',
    Failed: 'red',
  };
</script>

<Table>
  <TableHeaderRow slot="headers">
    <th>Status</th>
    <th>Job ID</th>
    <th>Start Time</th>
    <th>Close Time</th>
  </TableHeaderRow>
  {#each operations as { state, jobId, startTime, closeTime }}
    <TableRow>
      <td>
        <Badge type={jobStateToBadgeType[state]}>
          {state}
        </Badge>
      </td>
      <td
        ><Link href={routeForBatchOperation({ namespace, jobId })}>{jobId}</Link
        ></td
      >
      <td>{formatDate(startTime, $timeFormat)}</td>
      <td>{formatDate(closeTime, $timeFormat)}</td>
    </TableRow>
  {/each}
</Table>
