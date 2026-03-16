<script lang="ts">
  import debounce from 'just-debounce';

  import { page } from '$app/state';

  import WorkerTableRow from '$lib/components/task-queue/worker-table-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getServerlessWorkers } from '$lib/services/serverless-worker-service';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { routeForServerlessWorkerCreate } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import ServerlessWorkerTableRow from './serverless-worker-table-row.svelte';
  import WorkersActiveEmptyState from './workers-active-empty-state.svelte';

  let { namespace } = $props();

  const query = $derived(page.url.searchParams.get('query') || '');
  const serverlessWorkers = getServerlessWorkers();

  const filteredServerlessWorkers = $derived(
    query
      ? serverlessWorkers.filter(
          (sw) =>
            sw.name.toLowerCase().includes(query.toLowerCase()) ||
            sw.taskQueue.toLowerCase().includes(query.toLowerCase()),
        )
      : serverlessWorkers,
  );

  let search = $state(query);

  const searchParamUpdate = debounce((value: string) => {
    updateQueryParameters({
      parameter: 'query',
      value,
      url: page.url,
    });
  }, 350);

  $effect(() => {
    searchParamUpdate(search);
  });

  const columns = [
    { label: translate('workers.status') },
    { label: translate('workers.name') },
    { label: translate('workers.task-queue') },
    { label: translate('workers.compute') },
    { label: translate('workers.last-heartbeat') },
    { label: translate('workers.sdk-version') },
  ];

  const onFetch = $derived(() =>
    fetchPaginatedWorkers({ namespace, query }).then((fetcher) => {
      return (pageSize: number, token: string) =>
        fetcher(pageSize, token).catch(() => ({
          items: [],
          nextPageToken: '',
        }));
    }),
  );
</script>

<div class="mb-4 flex items-center justify-between gap-4">
  <div class="flex-1">
    <Input
      id="worker-search"
      label={translate('workers.filter-workers')}
      labelHidden
      type="search"
      placeholder={translate('workers.filter-placeholder')}
      bind:value={search}
      icon="search"
    />
  </div>
  <Button href={routeForServerlessWorkerCreate({ namespace })}>
    {translate('workers.create-serverless-worker')}
  </Button>
</div>

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
      {#each columns as { label } (label)}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems as worker, i (i)}
      <WorkerTableRow {worker} {columns} {namespace} filterable />
    {/each}
    {#each filteredServerlessWorkers as sw (sw.id)}
      <ServerlessWorkerTableRow worker={sw} {columns} {namespace} />
    {/each}

    <svelte:fragment slot="empty">
      {#if filteredServerlessWorkers.length === 0}
        <WorkersActiveEmptyState />
      {/if}
    </svelte:fragment>
  </PaginatedTable>
{/key}
