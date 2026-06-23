<script lang="ts">
  import { untrack } from 'svelte';

  import { page } from '$app/state';

  import Skeleton from '$lib/components/workers/worker-details/skeleton.svelte';
  import WorkerDetails from '$lib/components/workers/worker-details/worker-details.svelte';
  import Error from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeWorker } from '$lib/services/worker-service';
  import type { WorkerInfo } from '$lib/types';
  import type { NetworkError } from '$lib/types/global';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const { namespace, workerInstanceKey } = $derived(page.params);

  let worker = $state<WorkerInfo | null | undefined>();
  let error = $state<NetworkError | null>(null);
  let refreshing = $state(false);

  async function loadWorker() {
    if (worker) refreshing = true;
    try {
      const data = await describeWorker({ namespace, workerInstanceKey });
      worker = data.workerInfo;
      error = null;
    } catch (e) {
      error = e as NetworkError;
    } finally {
      refreshing = false;
    }
  }

  $effect(() => {
    void namespace;
    void workerInstanceKey;
    untrack(() => {
      worker = undefined;
      error = null;
      loadWorker();
    });
  });
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

{#if error}
  {@render breadcrumb()}
  <Error {error} status={error.statusCode} />
{:else if worker === undefined}
  <Skeleton {breadcrumb} />
{:else}
  <WorkerDetails {worker} {breadcrumb} onrefresh={loadWorker} {refreshing} />
{/if}
