<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getPollers } from '$lib/services/pollers-service';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export const load: Load = async function ({ params, stuff }) {
    const { namespace } = params;
    const { workflow } = stuff;
    const { taskQueue } = workflow as WorkflowExecution;

    const workers = await getPollers({ queue: taskQueue, namespace });

    return {
      props: { workers, taskQueue },
    };
  };
</script>

<!-- <script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import type { GetPollersResponse } from '$lib/services/pollers-service';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  export const load: Load = async function ({ params, stuff }) {
    const { workflow } = stuff;
    const { taskQueue } = workflow as WorkflowExecution;
    const path = routeForWorkflow({
      namespace: params.namespace,
      workflow: params.workflow,
      run: params.run,
      endpoint: 'workers.json',
    });
    const body = JSON.stringify({ queue: taskQueue });
    const workers = await fetch(path, {
      method: 'POST',
      body,
    }).then((r) => r.json());

    return {
      props: { workers, taskQueue },
    };
  };
</script> -->
<script lang="ts">
  import Icon from 'svelte-fa';
  import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
  import { formatDate } from '$lib/utilities/format-date';

  import EmptyState from '$lib/components/empty-state.svelte';

  export let workers: GetPollersResponse;
  export let taskQueue: string;
</script>

<section class="flex flex-col gap-4">
  <h3 class="text-lg font-medium">Task Queue: {taskQueue}</h3>
  {#each workers.pollers as poller (poller.identity)}
    <section class="flex flex-col border-2 border-gray-300 w-full rounded-lg">
      <div class="bg-gray-200 flex flex-row p-2">
        <div class="w-3/12 text-left">ID</div>
        <div class="w-3/12 text-left">Last Accessed</div>
        <div class="w-3/12 text-left">Workflow Task Handler</div>
        <div class="w-2/12 text-left">Activity Handler</div>
      </div>
      <article
        class="w-full h-full flex flex-row border-b-2 last:border-b-0 no-underline p-2"
      >
        <div class="links w-3/12 text-left">
          {poller.identity}
        </div>
        <div class="links w-3/12 text-left">
          <h3>
            <p>{formatDate(poller.lastAccessTime)}</p>
          </h3>
        </div>
        <div class="w-3/12 text-left">
          {#if poller.taskQueueTypes.includes('WORKFLOW')}
            <Icon icon={faCheck} color="blue" />
          {:else}
            <Icon icon={faTimes} color="black" />
          {/if}
        </div>
        <div class="w-3/12 text-left">
          {#if poller.taskQueueTypes.includes('ACTIVITY')}
            <Icon icon={faCheck} color="blue" />
          {:else}
            <Icon icon={faTimes} color="black" />
          {/if}
        </div>
      </article>
    </section>
  {:else}
    <EmptyState title={'No Workers Found'} />
  {/each}
</section>
