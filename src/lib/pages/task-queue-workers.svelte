<script lang="ts">
  import { page } from '$app/stores';

  import WorkersList from '$lib/components/workers-list.svelte';
  import {
    type PollerWithTaskQueueTypes,
    getPollers,
    getTaskQueueCompatibility,
  } from '$lib/services/pollers-service';

  let { queue, namespace } = $page.params;

  function pollerHasVersioning(pollers: PollerWithTaskQueueTypes[]) {
    return pollers?.some(
      (poller) => poller?.workerVersionCapabilities?.useVersioning,
    );
  }
</script>

{#await getPollers({ queue, namespace }) then workers}
  {@const versioningEnabled = pollerHasVersioning(workers.pollers)}
  {#if versioningEnabled}
    {#await getTaskQueueCompatibility({ queue, namespace }) then compatibility}
      <WorkersList taskQueue={queue} {workers} {compatibility} />
    {:catch}
      <WorkersList taskQueue={queue} {workers} />
    {/await}
  {:else}
    <WorkersList taskQueue={queue} {workers} />
  {/if}
{/await}
