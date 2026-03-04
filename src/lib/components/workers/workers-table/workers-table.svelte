<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable, {
    type PaginatedRequest,
  } from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkerInfo } from '$lib/types';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  import WorkersTableRow from './workers-table-row.svelte';

  interface Props {
    filterable?: boolean;
    namespace: string;
    onFetch: () => Promise<PaginatedRequest<WorkerInfo>>;
    onError?: (err: APIErrorResponse) => void;
  }

  let { filterable = false, namespace, onFetch, onError }: Props = $props();

  const columns = [
    { label: translate('workers.status') },
    { label: translate('workers.instance') },
    { label: translate('workers.task-queue') },
    { label: translate('workers.identity') },
    { label: translate('workers.host-name') },
    { label: translate('workers.sdk') },
  ];
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
  {#each visibleItems as worker (worker.workerHeartbeat.workerInstanceKey)}
    <WorkersTableRow {worker} {namespace} {filterable} />
  {/each}

  <svelte:fragment slot="empty">
    <EmptyState title={translate('workers.empty-state-title')}></EmptyState>
  </svelte:fragment>
</PaginatedTable>
