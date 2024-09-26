<script lang="ts">
  import { page } from '$app/stores';

  import WorkerCompatibility from '$lib/components/worker-compatibility.svelte';
  import WorkerRules from '$lib/components/worker-rules.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
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

  $: hasRules = (rules) => {
    return rules?.assignmentRules || rules?.compatibleRedirectRules;
  };
</script>

{#await getVersioning({ namespace, queue: taskQueue })}
  <SkeletonTable rows={3} />
{:then { rules, compatibility, versionSets }}
  {#if hasRules(rules)}
    <WorkerRules {rules} />
  {:else if versioningEnabled && versionSets?.length}
    {#await getWorkerTaskReachability( { namespace, buildIds, queue: taskQueue }, )}
      <SkeletonTable rows={3} />
    {:then reachability}
      <slot {compatibility} />
      <WorkerCompatibility
        {taskQueue}
        {workers}
        {compatibility}
        {reachability}
      />
    {/await}
  {:else}
    <p>No versioning configured for task queue.</p>
  {/if}
{/await}
