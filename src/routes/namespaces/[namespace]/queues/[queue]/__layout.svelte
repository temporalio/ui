<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { GetPollersResponse } from '$lib/services/pollers-service';
  import { getPollers } from '$lib/services/pollers-service';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace, queue } = page.params;
    return await getPollers({ queue, namespace }, fetch).then((pollers) => ({
      props: { pollers },
    }));
  }
</script>

<script lang="ts">
  import QueuePollersTable from './_queue-pollers-table.svelte';
  import QueuePollersRow from './_queue-pollers-row.svelte';

  export let pollers: GetPollersResponse;
</script>

<section class="flex flex-col items-start">
  <header class="p-3 mb-5">
    <h3 class="text-2xl">Pollers</h3>
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
