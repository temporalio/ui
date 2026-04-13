<script lang="ts">
  import { page } from '$app/state';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable, {
    type PaginatedRequest,
  } from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';

  import WorkerHeartbeatsSDKAlert from './worker-heartbeats-sdk-warning.svelte';
  import WorkersQueryEmptyState from './workers-query-empty-state.svelte';
  import WorkersTableRow from './workers-table-row.svelte';

  interface Props {
    filterable?: boolean;
    namespace: string;
    onFetch: () => Promise<PaginatedRequest<WorkerListInfo | WorkerHeartbeat>>;
    onError?: (err: unknown) => void;
  }

  let { filterable = false, namespace, onFetch, onError }: Props = $props();

  const columns = [
    { label: translate('workers.status') },
    { label: translate('workers.instance', { count: 1 }) },
    { label: translate('deployments.deployment') },
    { label: translate('deployments.build-id') },
    { label: translate('workers.task-queue') },
    { label: translate('workers.identity') },
    { label: translate('workers.host-name') },
    { label: translate('common.start-time') },
    { label: translate('workers.sdk') },
  ];

  const hasQuery = $derived(page.url.searchParams.get('query') !== null);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
</script>

<PaginatedTable
  let:visibleItems
  {onFetch}
  {onError}
  aria-label={translate('workers.workers')}
  pageSizeSelectLabel={translate('common.per-page')}
  nextButtonLabel={translate('common.next')}
  previousButtonLabel={translate('common.previous')}
  emptyStateMessage={translate('workers.empty-state-title')}
  errorMessage={translate('workers.error-message-fetching')}
>
  <caption class="sr-only" slot="caption">
    {translate('workers.workers')}
  </caption>

  <tr slot="headers" class="text-left">
    {#each columns as { label } (label)}
      <th>{label}</th>
    {/each}
  </tr>
  {#each visibleItems as worker, i (worker?.workerInstanceKey ?? i)}
    <WorkersTableRow {worker} {namespace} {filterable} />
  {/each}

  <svelte:fragment slot="empty">
    {#if hasQuery}
      <WorkersQueryEmptyState />
    {:else if runningWithNoWorkers}
      <EmptyState title={translate('workers.empty-state-title')} />
    {:else}
      <WorkerHeartbeatsSDKAlert />
    {/if}
  </svelte:fragment>
</PaginatedTable>
