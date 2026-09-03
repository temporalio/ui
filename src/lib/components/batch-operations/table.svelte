<script lang="ts">
  import OperationType from '$lib/components/batch-operations/operation-type.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge, type BadgeColorScheme } from '$lib/io/badge';
  import type {
    BatchOperationInfo,
    BatchOperationState,
  } from '$lib/types/batch';
  import { routeForBatchOperation } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    operations: BatchOperationInfo[];
  }

  let { namespace, operations }: Props = $props();

  const jobStateToColorScheme: Record<BatchOperationState, BadgeColorScheme> = {
    Completed: 'success',
    Running: 'info',
    Failed: 'danger',
    Unspecified: 'neutral',
  };
</script>

<Table>
  {#snippet caption()}
    <caption class="sr-only">{translate('batch.list-page-title')}</caption>
  {/snippet}
  {#snippet headers()}
    <TableHeaderRow>
      <th scope="col" class="w-28">{translate('common.status')}</th>
      <th scope="col" class="w-auto">{translate('common.job-id')}</th>
      <th scope="col" class="w-40">{translate('batch.operation-type')}</th>
      <th scope="col" class="max-sm:hidden lg:w-56"
        >{translate('common.start-time')}</th
      >
      <th scope="col" class="max-sm:hidden lg:w-56"
        >{translate('common.close-time')}</th
      >
    </TableHeaderRow>
  {/snippet}
  {#each operations as { state, jobId, operationType, startTime, closeTime }, i (`${jobId}:${i}`)}
    <TableRow>
      <td>
        <Badge text={state} colorScheme={jobStateToColorScheme[state]} />
      </td>
      <td
        ><Link href={routeForBatchOperation({ namespace, jobId })}>{jobId}</Link
        ></td
      >
      <td>
        <OperationType {operationType} />
      </td>
      <Timestamp as="td" class="max-sm:hidden" dateTime={startTime} />
      <Timestamp as="td" class="max-sm:hidden" dateTime={closeTime} />
    </TableRow>
  {:else}
    <TableRow>
      <td class="max-sm:hidden" colspan="5">
        <EmptyState title={translate('batch.empty-state-title')}></EmptyState>
      </td>
    </TableRow>
  {/each}
</Table>
