<script lang="ts">
  import FallbackWorkersTable from '$lib/components/worker-table.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import { translate } from '$lib/i18n/translate';
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
  {#await getPollers({ queue: taskQueue, namespace })}
    <Skeleton class="h-8 w-24 rounded-none" />
    <SkeletonTable rows={5} />
  {:then workers}
    <FallbackWorkersTable {workers} {searchAttributes} />
  {:catch error}
    <Alert
      intent="error"
      title={error?.message ?? translate('workers.error-message-fetching')}
      class="max-w-screen-lg xl:w-2/3"
    />
  {/await}
{/snippet}

{#if useFallback}
  {@render fallback()}
{:else}
  <WorkersTable {namespace} {onFetch} />
{/if}
