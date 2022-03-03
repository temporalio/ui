<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getPollers } from '$lib/services/pollers-service';
  export const load: Load = async function ({ fetch, params }) {
    const { namespace, queue } = params;

    return await getPollers({ queue, namespace }, fetch).then((pollers) => ({
      props: { pollers },
    }));
  };
</script>

<script lang="ts">
  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export let pollers: GetPollersResponse;
</script>

<section>
  <h1 class="text-4xl mb-4">Workers</h1>
  {#each pollers.pollers as poller}
    <WorkersTable>
      <WorkersRow {poller} />
    </WorkersTable>
  {:else}
    <EmptyState title={'No Workers Found'} />
  {/each}
</section>
