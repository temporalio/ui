<script lang="ts">
  import { page } from '$app/state';

  import Skeleton from '$lib/components/workers/worker-details/skeleton.svelte';
  import WorkerDetails from '$lib/components/workers/worker-details/worker-details.svelte';
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
  <Skeleton {breadcrumb} />
{:then data}
  <WorkerDetails worker={data.workerInfo} {breadcrumb} />
{:catch error}
  {@render breadcrumb()}
  <Error {error} status={error.statusCode} />
{/await}
