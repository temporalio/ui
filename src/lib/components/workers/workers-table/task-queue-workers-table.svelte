<script lang="ts">
  import FallbackWorkersTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';
  import { isNotFound, isNotImplemented } from '$lib/utilities/handle-error';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  import WorkersTable from './workers-table.svelte';

  interface Props {
    namespace: string;
    taskQueue: string;
  }

  let { namespace, taskQueue }: Props = $props();
  let useFallback: boolean = $state(false);

  const onFetch = $derived(() =>
    fetchPaginatedWorkers({ namespace, query: `TaskQueue="${taskQueue}"` }),
  );

  const onError = (error: APIErrorResponse) => {
    if (isNotFound(error) || isNotImplemented(error)) useFallback = true;
  };
</script>

{#if useFallback}
  {#await getPollers({ queue: taskQueue, namespace }) then workers}
    <FallbackWorkersTable {workers} />
  {/await}
{:else}
  <WorkersTable {namespace} {onFetch} {onError} />
{/if}
