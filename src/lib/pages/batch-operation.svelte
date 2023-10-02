<script lang="ts">
  import { page } from '$app/stores';

  import BatchOperationDetails from '$lib/components/batch-operations/details.svelte';
  import BatchOperationHeader from '$lib/components/batch-operations/header.svelte';
  import BatchOperationResults from '$lib/components/batch-operations/results.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeBatchOperation } from '$lib/services/batch-service';
  import { autoRefresh, batchOperation } from '$lib/stores/batch-operations';
  import { routeForBatchOperations } from '$lib/utilities/route-for';

  export let namespace: string;

  let interval: number;

  $: {
    if (
      $autoRefresh === 'on' &&
      $batchOperation.state === 'Running' &&
      interval === undefined
    ) {
      interval = window.setInterval(async () => {
        $batchOperation = await describeBatchOperation({
          namespace: $page.params.namespace,
          jobId: $batchOperation.jobId,
        });
      }, 5000);
    } else if (
      ($autoRefresh === 'off' || $batchOperation.state !== 'Running') &&
      interval !== undefined
    ) {
      clearInterval(interval);
      interval = undefined;
    }
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-row">
    <Link href={routeForBatchOperations({ namespace })} icon="chevron-left">
      {translate('batch', 'back-link')}
    </Link>
  </div>
  <BatchOperationHeader operation={$batchOperation} />
  <Card>
    <BatchOperationDetails operation={$batchOperation} />
  </Card>
  <Card>
    <BatchOperationResults operation={$batchOperation} />
  </Card>
</div>
