<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import { getPollers } from '$lib/services/pollers-service';
  export async function load({ fetch, page }: LoadInput) {
    const { namespace, queue } = page.params;

    return await getPollers({ queue, namespace }, fetch).then((pollers) => ({
      props: { pollers },
    }));
  }
</script>

<script lang="ts">
  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let pollers;
</script>

<section>
  {#each pollers.pollers as poller}
    <WorkersTable>
      <WorkersRow {poller} />
    </WorkersTable>
  {:else}
    <EmptyState title={'No Workers Found'} />
  {/each}
</section>
