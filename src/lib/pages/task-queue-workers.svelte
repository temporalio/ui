<script lang="ts">
  import { page } from '$app/stores';

  import WorkerCompatibility from '$lib/components/worker-compatibility.svelte';
  import WorkerRules from '$lib/components/worker-rules.svelte';
  import WorkerTable from '$lib/components/worker-table.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    type GetPollersResponse,
    getVersioning,
    getWorkerTaskReachability,
  } from '$lib/services/pollers-service';
  import {
    getUniqueBuildIdsFromPollers,
    pollerHasVersioning,
  } from '$lib/utilities/task-queue-compatibility';

  export let taskQueue: string;
  export let workers: GetPollersResponse;

  $: ({ namespace } = $page.params);
  $: versioningEnabled = pollerHasVersioning(workers.pollers);
  $: buildIds = getUniqueBuildIdsFromPollers(workers.pollers);
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-lg font-medium" data-testid="task-queue-name">
    {translate('common.task-queue')}:
    <span class="select-all font-normal">{taskQueue}</span>
  </h2>
  {#await getVersioning({ namespace, queue: taskQueue })}
    <SkeletonTable rows={3} />
  {:then { rules, compatibility, versionSets }}
    {#if rules}
      <WorkerRules {workers} {rules} />
    {:else if versioningEnabled && versionSets?.length}
      {#await getWorkerTaskReachability( { namespace, buildIds, queue: taskQueue }, )}
        <SkeletonTable rows={3} />
      {:then reachability}
        <WorkerCompatibility
          {taskQueue}
          {workers}
          {compatibility}
          {reachability}
        />
      {/await}
    {:else}
      <WorkerTable {workers} />
    {/if}
  {:catch}
    <WorkerTable {workers} />
  {/await}
</section>
