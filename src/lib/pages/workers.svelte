<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import FilterBar from '$lib/components/shared-search-attribute-filter/filter-bar.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/workers-table.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { workerFilters } from '$lib/stores/filters';
  import {
    workerSearchAttributeOptions,
    workerSearchAttributes,
  } from '$lib/stores/search-attributes';
  import { isNotImplemented } from '$lib/utilities/handle-error';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  const { namespace } = $derived(page.params);
  const query = $derived(page.url.searchParams.get('query') || '');
  const onFetch = $derived(() => fetchPaginatedWorkers({ namespace, query }));

  let showAlert = $state(false);

  onMount(() => {
    const query = page.url.searchParams.get('query') ?? '';
    if (query) {
      $workerFilters = toListWorkflowFilters(query, $workerSearchAttributes);
    }
  });

  $effect(() => {
    void namespace;
    showAlert = false;
  });

  const onError = (error: APIErrorResponse) => {
    if (isNotImplemented(error)) showAlert = true;
  };
</script>

{#if showAlert}
  <Alert intent="info">
    <!-- TODO: Add text here? -->
  </Alert>
{:else}
  <FilterBar
    filters={workerFilters}
    options={$workerSearchAttributeOptions}
    id="worker"
    statusAttribute="WorkerStatus"
  />

  {#key [namespace, query]}
    <WorkersTable {namespace} {onFetch} {onError} filterable />
  {/key}
{/if}
