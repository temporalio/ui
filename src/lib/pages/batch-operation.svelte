<script lang="ts">
  import { page } from '$app/stores';

  import BatchOperationDetails from '$lib/components/batch-operations/details.svelte';
  import BatchOperationHeader from '$lib/components/batch-operations/header.svelte';
  import BatchOperationResults from '$lib/components/batch-operations/results.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeBatchOperation } from '$lib/services/batch-service';
  import { autoRefresh } from '$lib/stores/batch-operations';
  import type { BatchOperation } from '$lib/types/batch';
  import { routeForBatchOperations } from '$lib/utilities/route-for';

  export let namespace: string;
  export let operation: BatchOperation;

  let interval: number;

  $: {
    if (
      $autoRefresh === 'on' &&
      operation.state === 'Running' &&
      interval === undefined
    ) {
      interval = window.setInterval(async () => {
        operation = await describeBatchOperation({
          namespace: $page.params.namespace,
          jobId: operation.jobId,
        });
      }, 5000);
    } else if (
      ($autoRefresh === 'off' || operation.state !== 'Running') &&
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
  <BatchOperationHeader {operation} />
  <Card>
    <BatchOperationDetails {operation} />
  </Card>
  <Card>
    <BatchOperationResults {operation} />
  </Card>
</div>
