<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import { getPollers } from '$lib/services/pollers-service';

  export async function load({ page }: LoadInput) {
    const { namespace } = page.params;

    return {
      props: { namespace },
    };
  }
</script>

<script lang="ts">
  import { getContext } from 'svelte';
  import { refreshable } from '$lib/stores/refreshable';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let namespace: string;

  $: pollers = refreshable(async () => {
    let workflow = await getContext<PromiseLike<WorkflowExecution>>('workflow');
    return getPollers({ queue: workflow.taskQueue, namespace });
  });
</script>

<section>
  {#await $pollers then workers}
    {#each workers.pollers as poller}
      <WorkersTable>
        <WorkersRow {poller} />
      </WorkersTable>
    {:else}
      <EmptyState title={'No Workers Found'} />
    {/each}
  {/await}
</section>
