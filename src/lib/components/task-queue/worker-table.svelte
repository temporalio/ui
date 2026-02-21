<script lang="ts">
  import FallbackWorkerTable from '$lib/components/worker-table.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getPollers } from '$lib/services/pollers-service';
  import { fetchPaginatedWorkersForTaskQueue } from '$lib/services/worker-service';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  import WorkerTableRow from './worker-table-row.svelte';

  let { namespace, taskQueue } = $props();
  let error: string | null = $state(null);

  const columns = $derived([
    { label: translate('workers.status') },
    { label: translate('workers.instance') },
    { label: translate('workers.identity') },
    { label: translate('workers.host-name') },
    { label: translate('workers.workflow-task-slots') },
    { label: translate('workers.activity-task-slots') },
    { label: translate('workers.nexus-task-slots') },
    { label: translate('workers.sdk') },
  ]);

  const onFetch = $derived(() =>
    fetchPaginatedWorkersForTaskQueue({ namespace, taskQueue }),
  );

  const onError = (err: APIErrorResponse) => {
    error = err?.body?.message || translate('workers.error-message-fetching');
  };
</script>

{#if !error}
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
    <caption class="sr-only" slot="caption"
      >{translate('workers.workers')}</caption
    >

    <tr slot="headers" class="text-left">
      {#each columns as { label }}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems as worker}
      <WorkerTableRow {worker} {columns} {namespace} />
    {/each}

    <svelte:fragment slot="empty">
      <EmptyState title={translate('workers.empty-state-title')}></EmptyState>
    </svelte:fragment>
  </PaginatedTable>
{:else}
  {#await getPollers({ queue: taskQueue, namespace }) then workers}
    <FallbackWorkerTable {workers} />
  {/await}
{/if}
