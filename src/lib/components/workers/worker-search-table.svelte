<script lang="ts">
  import { page } from '$app/state';

  import WorkerTableRow from '$lib/components/task-queue/worker-table-row.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';

  let { namespace } = $props();

  const query = $derived(page.url.searchParams.get('query') || '');

  const columns = $derived([
    { label: translate('workers.status') },
    { label: translate('workers.instance') },
    { label: translate('workers.task-queue') },
    { label: translate('workers.identity') },
    { label: translate('workers.host-name') },
    { label: translate('workers.workflow-task-slots') },
    { label: translate('workers.activity-task-slots') },
    { label: translate('workers.nexus-task-slots') },
    { label: translate('workers.sdk') },
  ]);

  const onFetch = $derived(() => fetchPaginatedWorkers({ namespace, query }));
</script>

{#key query}
  <PaginatedTable
    let:visibleItems
    {onFetch}
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
      <WorkerTableRow {worker} {columns} {namespace} filterable />
    {/each}

    <svelte:fragment slot="empty">
      <EmptyState title={translate('workers.empty-state-title')}></EmptyState>
    </svelte:fragment>
  </PaginatedTable>
{/key}
