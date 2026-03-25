<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import FilterBar from '$lib/components/shared-search-attribute-filter/filter-bar.svelte';
  import WorkerHeartbeatsDisabled from '$lib/components/workers/worker-heartbeats-disabled.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/workers-table.svelte';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { workerFilters } from '$lib/stores/filters';
  import {
    workerSearchAttributeOptions,
    workerSearchAttributes,
  } from '$lib/stores/search-attributes';
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
  />

  {#key [namespace, query]}
    <WorkersTable
      {namespace}
      onFetch={() => fetchPaginatedWorkers({ namespace, query })}
      filterable
    />
  {/key}
{:else}
  <WorkerHeartbeatsDisabled />
{/if}
