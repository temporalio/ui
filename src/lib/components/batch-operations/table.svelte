<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    BatchOperationInfo,
    BatchOperationState,
  } from '$lib/types/batch';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForBatchOperation } from '$lib/utilities/route-for';

  export let namespace: string;
  export let operations: BatchOperationInfo[];

  const jobStateToBadgeType: Record<BatchOperationState, BadgeType> = {
    Completed: 'success',
    Running: 'primary',
    Failed: 'danger',
    Unspecified: undefined,
  };
</script>

<Table class="w-full">
  <caption class="sr-only" slot="caption">
    {translate('batch.list-page-title')}
  </caption>
  <TableHeaderRow slot="headers">
    <th class="w-28">{translate('common.status')}</th>
    <th class="w-auto">{translate('common.job-id')}</th>
    <th class="max-sm:hidden lg:w-56">{translate('common.start-time')}</th>
    <th class="max-sm:hidden lg:w-56">{translate('common.close-time')}</th>
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
      <td class="max-sm:hidden"
        >{formatDate(startTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
      <td class="max-sm:hidden"
        >{formatDate(closeTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    </TableRow>
  {:else}
    <TableRow>
      <td class="max-sm:hidden" colspan="4">
        <EmptyState title={translate('batch.empty-state-title')}></EmptyState>
      </td>
    </TableRow>
  {/each}
</Table>
