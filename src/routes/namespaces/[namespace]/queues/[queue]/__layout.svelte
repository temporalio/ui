<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace, queue } = page.params;
    return await WorkflowExecutionAPI.getPollers(
      { queue, namespace },
      fetch,
    ).then((pollers) => ({
      props: { pollers },
    }));
  }
</script>

<script lang="ts">
  import QueuePollersTable from './_queue-pollers-table.svelte';
  import QueuePollersRow from './_queue-pollers-row.svelte';
  import type { GetPollerRequest } from '$types//temporal/api/taskqueue/v1/message';

  export let pollers: GetPollerRequest;
  console.log(pollers);
</script>

<section class="flex flex-col items-start">
  <header>
    <h3>Pollers</h3>
  </header>
  <div class="w-full h-full overflow-x-scroll">
    <QueuePollersTable>
      <tbody slot="rows">
        {#each pollers.pollers as poller}
          <QueuePollersRow {poller} />
        {:else}
          <tr>
            <td
              colspan="4"
              class="m-auto p-12 text-center font-extralight text-2xl"
              >No Results</td
            >
          </tr>
        {/each}
      </tbody>
    </QueuePollersTable>
  </div>
</section>

<style lang="postcss">
  header {
    padding: 12px;
    margin-bottom: 18px;
  }

  h3 {
    font-size: 24px;
  }
</style>
