<script lang="ts">
  import { page } from '$app/state';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable, {
    type PaginatedRequest,
  } from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';
  import type { TableSort, TableSortColumn } from '$lib/utilities/table-sort';

  import WorkerHeartbeatsSDKAlert from './worker-heartbeats-sdk-warning.svelte';
  import WorkersQueryEmptyState from './workers-query-empty-state.svelte';
  import WorkersTableRow from './workers-table-row.svelte';

  interface Props {
    filterable?: boolean;
    namespace: string;
    onFetch: () => Promise<PaginatedRequest<WorkerListInfo | WorkerHeartbeat>>;
    onError?: (err: unknown) => void;
    total?: number;
    sort?: TableSort;
  }

  let {
    filterable = false,
    namespace,
    onFetch,
    onError,
    total,
    sort = $bindable(),
  }: Props = $props();

  const sortColumns: Record<
    string,
    TableSortColumn<WorkerListInfo | WorkerHeartbeat>
  > = {
    [translate('workers.status')]: {
      getValue: (worker) => toWorkerStatusReadable(worker.status),
      type: 'string',
    },
    [translate('workers.instance', { count: 1 })]: {
      getValue: (worker) => worker.workerInstanceKey,
      type: 'string',
    },
    [translate('deployments.deployment')]: {
      getValue: (worker) => worker.deploymentVersion?.deploymentName,
      type: 'string',
    },
    [translate('deployments.build-id')]: {
      getValue: (worker) => worker.deploymentVersion?.buildId,
      type: 'string',
    },
    [translate('workers.task-queue')]: {
      getValue: (worker) => worker.taskQueue,
      type: 'string',
    },
    [translate('workers.identity')]: {
      getValue: (worker) => worker.workerIdentity,
      type: 'string',
    },
    [translate('workers.host-name')]: {
      getValue: (worker) =>
        'hostName' in worker
          ? worker.hostName
          : 'hostInfo' in worker
            ? worker.hostInfo?.hostName
            : undefined,
      type: 'string',
    },
    [translate('common.start-time')]: {
      getValue: (worker) => worker.startTime,
      type: 'datetime',
    },
    [translate('workers.sdk')]: {
      getValue: (worker) =>
        `${formatSDKName(worker.sdkName)} ${worker.sdkVersion ?? ''}`,
      type: 'string',
    },
  };

  const hasQuery = $derived(page.url.searchParams.get('query') !== null);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
</script>

<PaginatedTable
  bind:sort
  {sortColumns}
  {onFetch}
  {onError}
  {total}
  aria-label={translate('workers.workers')}
  pageSizeSelectLabel={translate('common.per-page')}
  nextButtonLabel={translate('common.next')}
  previousButtonLabel={translate('common.previous')}
  emptyStateMessage={translate('workers.empty-state-title')}
  errorMessage={translate('workers.error-message-fetching')}
>
  {#snippet caption()}
    <caption class="sr-only">
      {translate('workers.workers')}
    </caption>
  {/snippet}

  {#snippet headers()}
    <tr class="text-left">
      {#each Object.keys(sortColumns) as label (label)}
        <SortableTableHeader column={label} />
      {/each}
    </tr>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as worker, i (worker?.workerInstanceKey ?? i)}
      <WorkersTableRow {worker} {namespace} {filterable} />
    {/each}
  {/snippet}

  {#snippet empty()}
    <div class="flex h-full flex-col items-center justify-center">
      {#if hasQuery}
        <WorkersQueryEmptyState />
      {:else if runningWithNoWorkers}
        <EmptyState title={translate('workers.empty-state-title')} />
      {:else}
        <WorkerHeartbeatsSDKAlert />
      {/if}
    </div>
  {/snippet}
</PaginatedTable>
