<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import type {
    BatchOperationInfo,
    BatchOperationState,
  } from '$lib/types/batch';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForBatchOperation } from '$lib/utilities/route-for';

  export let namespace: string;
  export let operations: BatchOperationInfo[];

  const jobStateToBadgeType: Record<BatchOperationState, BadgeType> = {
    Completed: 'green',
    Running: 'blue',
    Failed: 'red',
    Unspecified: 'gray',
  };
</script>

<Table>
  <TableHeaderRow slot="headers">
    <th>{translate('status')}</th>
    <th>{translate('job-id')}</th>
    <th>{translate('start-time')}</th>
    <th>{translate('close-time')}</th>
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
  {:else}
    <TableRow>
      <td colspan="4">
        <EmptyState title={translate('batch', 'empty-state-title')}
        ></EmptyState>
      </td>
    </TableRow>
  {/each}
</Table>
