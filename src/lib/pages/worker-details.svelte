<script lang="ts">
  import { page } from '$app/state';

  import WorkerInfoSkeleton from '$lib/components/workers/worker-details/skeleton.svelte';
  import WorkerInfo from '$lib/components/workers/worker-details/worker-details.svelte';
  import Error from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeWorker } from '$lib/services/worker-service';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const { namespace, workerInstanceKey } = $derived(page.params);
  const workerDetailsPromise = $derived(
    describeWorker({ namespace, workerInstanceKey }),
  );
</script>

{#snippet breadcrumb()}
  <Link
    href={routeForWorkers({ namespace })}
    data-testid="back-to-workers"
    icon="chevron-left"
  >
    {translate('workers.back-to-workers')}
  </Link>
{/snippet}

{#await workerDetailsPromise}
  <WorkerInfoSkeleton {breadcrumb} />
{:then data}
  <WorkerInfo worker={data.workerInfo} {breadcrumb} />
{:catch error}
  {@render breadcrumb()}
  <Error {error} status={error.statusCode} />
{/await}
