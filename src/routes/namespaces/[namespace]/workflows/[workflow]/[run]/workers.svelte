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
  import { Refreshable, refreshable } from '$lib/stores/refreshable';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let namespace: string;

  let workflow = getContext<Refreshable<WorkflowExecution>>('workflow');

  $: pollers = refreshable(async () => {
    let { taskQueue } = await $workflow;
    return getPollers({ queue: taskQueue, namespace });
  });
</script>

{#await $workflow then { taskQueue }}
  <section class="flex flex-col gap-4">
    <h3 class="text-lg font-medium">Task Queue: {taskQueue}</h3>
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
{/await}
