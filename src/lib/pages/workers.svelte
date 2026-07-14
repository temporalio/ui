<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import FilterBar from '$lib/components/search-attribute-filter/filter-bar.svelte';
  import WorkerHeartbeatsDisabled from '$lib/components/workers/worker-heartbeats-disabled.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/workers-table.svelte';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { workerFilters } from '$lib/stores/filters';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import {
    DEFAULT_WORKER_SYSTEM_VIEW,
    savedWorkerQueries,
    systemWorkerViews,
  } from '$lib/stores/saved-queries';
  import {
    workerSearchAttributeOptions,
    workerSearchAttributes,
  } from '$lib/stores/search-attributes';
  import { refresh } from '$lib/stores/workers';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  const { namespace } = $derived(page.params);
  const query = $derived(page.url.searchParams.get('query') || '');

  onMount(() => {
    const query = page.url.searchParams.get('query') ?? '';
    if (query) {
      $workerFilters = toListWorkflowFilters(query, $workerSearchAttributes);
    }
  });

  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );
</script>

{#if workerHeartbeatsEnabled}
  <FilterBar
    filters={workerFilters}
    options={$workerSearchAttributeOptions}
    searchAttributes={$workerSearchAttributes}
    id="worker"
    statusAttribute="WorkerStatus"
    includeNullConditions={false}
  />

  <div class="flex overflow-auto">
    <SavedQueryViews
      filters={workerFilters}
      savedQueries={savedWorkerQueries}
      systemViews={systemWorkerViews}
      defaultView={DEFAULT_WORKER_SYSTEM_VIEW}
      searchAttributes={workerSearchAttributes}
      id="worker"
    />
    <div
      class={merge(
        'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
        !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
      )}
    >
      {#key [namespace, query, $refresh]}
        <WorkersTable
          {namespace}
          onFetch={() => fetchPaginatedWorkers({ namespace, query })}
          filterable
        />
      {/key}
    </div>
  </div>
{:else}
  <WorkerHeartbeatsDisabled />
{/if}
