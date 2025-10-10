<script lang="ts">
  import { page } from '$app/state';

  import WorkerTable from '$lib/components/worker-table.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import {
    type DescribeWorkerResponse,
    listWorkers,
    type ListWorkersResponse,
    // describeWorker,
  } from '$lib/services/worker-service';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const { queue: taskQueue, namespace } = $derived(page.params);

  let listWorkersResponse = $state<ListWorkersResponse | null>(null);
  let describeWorkerResponses = $state<Record<string, DescribeWorkerResponse>>(
    {},
  );

  async function loadWorkers() {
    try {
      const response = await listWorkers({ queue: taskQueue, namespace });
      console.log('Workers response:', response);
      // listWorkersResponse = response;

      // const describePromises = response.workers.map(async (worker) => {
      //   const describeResponse = await describeWorker({
      //     queue: taskQueue,
      //     namespace,
      //     identity: worker.identity,
      //   });
      //   return { identity: worker.identity, response: describeResponse };
      // });

      // const results = await Promise.all(describePromises);
      // describeWorkerResponses = results.reduce(
      //   (acc, { identity, response }) => {
      //     acc[identity] = response;
      //     return acc;
      //   },
      //   {} as Record<string, DescribeWorkerResponse>,
      // );
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  }
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <section class="flex flex-col gap-4">
    <h1 data-testid="task-queue-name">
      {taskQueue}
    </h1>
    <WorkerTable {workers} />

    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Worker API Responses</h2>

      {#await loadWorkers()}
        <p>Loading workers...</p>
      {:then}
        {#if listWorkersResponse}
          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-medium">List Workers Response</h3>
            <CodeBlock
              content={stringifyWithBigInt(listWorkersResponse)}
              copyable={false}
            />
          </div>

          {#if listWorkersResponse.workers.length > 0}
            <div class="flex flex-col gap-4">
              <h3 class="text-lg font-medium">Describe Worker Responses</h3>
              {#each listWorkersResponse.workers as worker (worker.identity)}
                <div class="flex flex-col gap-2">
                  <h4 class="font-medium">Worker: {worker.identity}</h4>
                  {#if describeWorkerResponses[worker.identity]}
                    <CodeBlock
                      content={stringifyWithBigInt(
                        describeWorkerResponses[worker.identity],
                      )}
                      copyable={false}
                    />
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      {:catch error}
        <p class="text-red-600">Error loading workers: {error.message}</p>
      {/await}
    </div>
  </section>
{/await}
