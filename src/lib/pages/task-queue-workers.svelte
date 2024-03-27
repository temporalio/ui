<script lang="ts">
  import { page } from '$app/stores';

  import WorkersList from '$lib/components/workers-list.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import {
    getPollers,
    getTaskQueueCompatibility,
    getWorkerTaskReachability,
  } from '$lib/services/pollers-service';
  import {
    getUniqueBuildIdsFromPollers,
    pollerHasVersioning,
  } from '$lib/utilities/task-queue-compatibility';

  let { queue, namespace, taskQueue } = $page.params;
</script>

{#await getPollers({ queue, namespace }) then workers}
  {@const versioningEnabled = pollerHasVersioning(workers.pollers)}
  {#if versioningEnabled}
    {@const buildIds = getUniqueBuildIdsFromPollers(workers.pollers)}
    {#await Promise.all( [getTaskQueueCompatibility( { queue, namespace }, ), getWorkerTaskReachability( { namespace, buildIds, taskQueue }, )], )}
      <SkeletonTable rows={3} />
    {:then [compatibility, reachability]}
      <WorkersList taskQueue={queue} {workers} {compatibility} {reachability} />
    {:catch}
      <WorkersList taskQueue={queue} {workers} />
    {/await}
  {:else}
    <WorkersList taskQueue={queue} {workers} />
  {/if}
{/await}
