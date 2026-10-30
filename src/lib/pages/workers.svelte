<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import EmptyStateTransition from '$lib/components/empty-states/empty-state-transition.svelte';
  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import FilterBar from '$lib/components/search-attribute-filter/filter-bar.svelte';
  import WorkerHeartbeatsDisabled from '$lib/components/workers/worker-heartbeats-disabled.svelte';
  import WorkerHeartbeatsSdkWarning from '$lib/components/workers/workers-table/worker-heartbeats-sdk-warning.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/workers-table.svelte';
  import MaximizableTableView from '$lib/holocene/table/paginated-table/maximizable-view.svelte';
  import { createTableSort } from '$lib/runes/table-sort-state.svelte';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { workerFilters } from '$lib/stores/filters';
  import {
    DEFAULT_WORKER_SYSTEM_VIEW,
    savedWorkerQueries,
    systemWorkerViews,
  } from '$lib/stores/saved-queries';
  import {
    workerSearchAttributeOptions,
    workerSearchAttributes,
  } from '$lib/stores/search-attributes';
  import { refresh, workerCount } from '$lib/stores/workers';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  const { namespace } = $derived(page.params);
  const query = $derived(page.url.searchParams.get('query') || '');

  const tableSort = createTableSort(() => [namespace, query]);

  onMount(() => {
    const query = page.url.searchParams.get('query') ?? '';
    if (query) {
      $workerFilters = toListWorkflowFilters(query, $workerSearchAttributes);
    }
  });

  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );

  let firstPageEmpty = $state(false);
  let fetchFailed = $state(false);
  const showEmptyState = $derived(!query && firstPageEmpty && !fetchFailed);

  const onFetch = async () => {
    fetchFailed = false;
    const fetchPage = await fetchPaginatedWorkers({ namespace, query });
    return (size: number, token: string) =>
      fetchPage(size, token).then((result) => {
        if (!token) firstPageEmpty = result.items.length === 0;
        return result;
      });
  };
</script>

{#if workerHeartbeatsEnabled}
  <EmptyStateTransition empty={showEmptyState}>
    {#snippet emptyState()}
      <WorkerHeartbeatsSdkWarning showPlaceholder />
    {/snippet}
    <MaximizableTableView>
      <SavedQueryViews
        filters={workerFilters}
        savedQueries={savedWorkerQueries}
        systemViews={systemWorkerViews}
        defaultView={DEFAULT_WORKER_SYSTEM_VIEW}
        searchAttributes={workerSearchAttributes}
        id="worker"
      />
      <FilterBar
        filters={workerFilters}
        options={$workerSearchAttributeOptions}
        searchAttributes={$workerSearchAttributes}
        id="worker"
        statusAttribute="WorkerStatus"
      />
      {#key [namespace, query, $refresh]}
        <WorkersTable
          bind:sort={tableSort.value}
          {namespace}
          {onFetch}
          onError={() => (fetchFailed = true)}
          showSdkWarning={false}
          total={$workerCount.count}
          filterable
        />
      {/key}
    </MaximizableTableView>
  </EmptyStateTransition>
{:else}
  <WorkerHeartbeatsDisabled />
{/if}
