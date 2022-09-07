<script>import { page } from '$app/stores';
import PageTitle from '../holocene/page-title.svelte';
import WorkersList from '../components/workers-list.svelte';
import { getPollers } from '../services/pollers-service';
let { queue, namespace } = $page.params;
let workers = getPollers({ queue, namespace }, { returnAllPollers: true });
</script>

<PageTitle title={`Task Queue | ${queue}`} url={$page.url.href} />
{#await workers then workers}
  <WorkersList taskQueue={queue} {workers} />
{/await}
