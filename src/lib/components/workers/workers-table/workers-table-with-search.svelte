<script lang="ts">
  import { page } from '$app/state';

  import { fetchPaginatedWorkers } from '$lib/services/worker-service';

  import WorkersTable from './workers-table.svelte';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const query = $derived(page.url.searchParams.get('query') || '');
  const onFetch = $derived(() => fetchPaginatedWorkers({ namespace, query }));
</script>

{#key query}
  <WorkersTable {namespace} {onFetch} filterable />
{/key}
