<script lang="ts">
  import FallbackWorkersTable from '$lib/components/worker-table.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { fetchPaginatedWorkers } from '$lib/services/worker-service';

  import WorkersTable from './workers-table.svelte';

  interface Props {
    namespace: string;
    useFallback?: boolean;
    searchAttributes?: Record<string, string>;
    taskQueue: string;
  }

  let {
    namespace,
    useFallback = false,
    searchAttributes,
    taskQueue,
  }: Props = $props();

  const onFetch = $derived(() =>
    fetchPaginatedWorkers({ namespace, query: `TaskQueue="${taskQueue}"` }),
  );
</script>

{#snippet fallback()}
  {#await getPollers({ queue: taskQueue, namespace }) then workers}
    <FallbackWorkersTable {workers} {searchAttributes} />
  {/await}
{/snippet}

{#if useFallback}
  {@render fallback()}
{:else}
  <WorkersTable {namespace} {onFetch} />
{/if}
