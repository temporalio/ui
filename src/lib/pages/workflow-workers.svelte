<script lang="ts">
  import { page } from '$app/stores';

  import WorkersList from '$lib/components/workers-list.svelte';
  import { getWorkerTaskReachability } from '$lib/services/pollers-service';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    getUniqueBuildIdsFromPollers,
    pollerHasVersioning,
  } from '$lib/utilities/task-queue-compatibility';

  let { namespace } = $page.params;
  $: ({ workers, workflow, compatibility } = $workflowRun);

  $: taskQueue = workflow?.taskQueue;
  $: versioningEnabled = pollerHasVersioning(workers.pollers);
</script>

{#if versioningEnabled}
  {@const buildIds = getUniqueBuildIdsFromPollers(workers.pollers)}
  {#await getWorkerTaskReachability( { namespace, buildIds, taskQueue }, ) then reachability}
    <WorkersList {taskQueue} {workers} {compatibility} {reachability} />
  {:catch}
    <WorkersList {taskQueue} {workers} />
  {/await}
{:else}
  <WorkersList {taskQueue} {workers} />
{/if}
