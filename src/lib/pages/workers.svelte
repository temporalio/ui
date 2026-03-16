<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import FilterBar from '$lib/components/shared-search-attribute-filter/filter-bar.svelte';
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
  const onFetch = $derived(() => fetchPaginatedWorkers({ namespace, query }));

  onMount(() => {
    const query = page.url.searchParams.get('query') ?? '';
    if (query) {
      $workerFilters = toListWorkflowFilters(query, $workerSearchAttributes);
    }
  });
</script>

<FilterBar
  filters={workerFilters}
  options={$workerSearchAttributeOptions}
  id="worker"
  statusAttribute="WorkerStatus"
/>

{#key [namespace, query]}
  <WorkersTable {namespace} {onFetch} filterable />
{/key}
