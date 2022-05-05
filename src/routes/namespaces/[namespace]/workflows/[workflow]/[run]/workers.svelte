<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export const load: Load = async function ({ stuff }) {
    const { workflow, workers } = stuff;
    const { taskQueue } = workflow as WorkflowExecution;

    return {
      props: { workers, taskQueue },
    };
  };
</script>

<script lang="ts">
  import Icon from 'svelte-fa';
  import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  import EmptyState from '$lib/components/empty-state.svelte';

  export let workers: GetPollersResponse;
  export let taskQueue: string;
</script>

<section class="flex flex-col gap-4">
  <h3 class="text-lg font-medium">
    Task Queue: <span class="select-all font-normal">{taskQueue}</span>
  </h3>
  <section class="flex flex-col border-2 border-gray-900 w-full rounded-lg">
    <div class="bg-gray-900 text-white flex flex-row p-2">
      <div class="w-3/12 text-left">ID</div>
      <div class="w-3/12 text-left">Last Accessed</div>
      <div class="w-3/12 text-left">Workflow Task Handler</div>
      <div class="w-2/12 text-left">Activity Handler</div>
    </div>
    {#each workers.pollers as poller (poller.identity)}
      <article
        class="w-full h-full flex flex-row border-b-2 last:border-b-0 no-underline p-2"
        data-cy="worker-row"
      >
        <div class="links w-3/12 text-left" data-cy="worker-identity">
          <p class="select-all">{poller.identity}</p>
        </div>
        <div class="links w-3/12 text-left" data-cy="worker-last-access-time">
          <h3>
            <p class="select-all">
              {formatDate(poller.lastAccessTime, $timeFormat)}
            </p>
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
    {:else}
      <EmptyState title={'No Workers Found'} />
    {/each}
  </section>
</section>
