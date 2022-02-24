<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { getPollers } from '$lib/services/pollers-service';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export async function load({ page, stuff }: LoadInput) {
    const { namespace } = page.params;
    const { workflow } = stuff;
    const { taskQueue } = workflow as WorkflowExecution;

    const workers = await getPollers({ queue: taskQueue, namespace });

    return {
      props: { workers, taskQueue },
    };
  }
</script>

<script lang="ts">
  import WorkersTable from '$lib/components/workers-table.svelte';
  import WorkersRow from '$lib/components/workers-row.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let workers: GetPollersResponse;
  export let taskQueue: string;
</script>

<section class="flex flex-col gap-4">
  <h3 class="text-lg font-medium">Task Queue: {taskQueue}</h3>
  {#each workers.pollers as poller}
    <WorkersTable>
      <WorkersRow {poller} />
    </WorkersTable>
  {:else}
    <EmptyState title={'No Workers Found'} />
  {/each}
</section>
