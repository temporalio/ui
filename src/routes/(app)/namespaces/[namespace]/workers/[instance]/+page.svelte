<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkerInfo from '$lib/components/task-queue/worker-info.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeWorker } from '$lib/services/worker-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const workerInstanceKey = $derived(page.params.instance);
</script>

<PageTitle title={`Workers | ${workerInstanceKey}`} url={page.url.href} />

<header class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Link
        href={routeForWorkers({ namespace })}
        data-testid="view-all-workers"
        icon="chevron-left"
      >
        {translate('workers.view-all-workers')}
      </Link>
    </div>
  </div>
</header>
{#await describeWorker({ namespace, workerInstanceKey }) then data}
  <WorkerInfo worker={data.workerInfo} />
{:catch error}
  <p class="text-red-500">Error loading worker info: {error.message}</p>
{/await}
