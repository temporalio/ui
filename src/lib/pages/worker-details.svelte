<script lang="ts">
  import { page } from '$app/state';

  import WorkerInfo from '$lib/components/workers/worker-info.svelte';
  import Error from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeWorker } from '$lib/services/worker-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const workerInstanceKey = $derived(page.params.workerInstanceKey);
</script>

<div class="flex items-center gap-2">
  <Link
    href={routeForWorkers({ namespace })}
    data-testid="view-all-workers"
    icon="chevron-left"
  >
    {translate('workers.view-all-workers')}
  </Link>
</div>
{#await describeWorker({ namespace, workerInstanceKey }) then data}
  <WorkerInfo worker={data.workerInfo} />
{:catch error}
  <Error {error} status={error.statusCode} />
{/await}
