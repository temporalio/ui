<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { getPollers } from '$lib/services/pollers-service';
  export async function load({ fetch, page, stuff }: LoadInput) {
    const { namespace } = page.params;
    const { workflow } = stuff as {
      workflow: WorkflowExecution;
    };
    return await getPollers(
      { queue: workflow.taskQueue, namespace },
      fetch,
    ).then((pollers) => ({
      props: { pollers },
    }));
  }
</script>

<script lang="ts">
  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import WorkersEmpty from '$lib/components/workers-empty.svelte';

  export let pollers;
</script>

<section>
  {#each pollers.pollers as poller}
    <WorkersTable>
      <WorkersRow {poller} />
    </WorkersTable>
  {:else}
    <WorkersEmpty />
  {/each}
</section>
