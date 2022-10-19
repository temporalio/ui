<script lang="ts">
  import { page } from '$app/stores';

  import WorkersList from '$lib/components/workers-list.svelte';
  import { getPollers } from '$lib/services/pollers-service';

  let { queue, namespace } = $page.params;

  let workers = getPollers({ queue, namespace }, { returnAllPollers: true });
</script>

{#await workers then workers}
  <WorkersList taskQueue={queue} {workers} />
{/await}
