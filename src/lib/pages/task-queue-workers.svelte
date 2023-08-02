<script lang="ts">
  import { page } from '$app/stores';

  import WorkersList from '$lib/components/workers-list.svelte';
  import {
    getPollers,
    getTaskQueueCompatibility,
  } from '$lib/services/pollers-service';

  let { queue, namespace } = $page.params;

  let getWorkers = getPollers({ queue, namespace });
  let getCompatibility = getTaskQueueCompatibility({
    queue,
    namespace,
  });
</script>

{#await getWorkers then workers}
  {#await getCompatibility then compatibility}
    <WorkersList taskQueue={queue} {workers} {compatibility} />
  {:catch}
    <WorkersList taskQueue={queue} {workers} />
  {/await}
{/await}
