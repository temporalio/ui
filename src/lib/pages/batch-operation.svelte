<script lang="ts">
  import BatchOperationDetails from '$lib/components/batch-operations/details.svelte';
  import BatchOperationHeader from '$lib/components/batch-operations/header.svelte';
  import BatchOperationResults from '$lib/components/batch-operations/results.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { describeBatchOperation } from '$lib/services/batch-service';
  import { autoRefresh } from '$lib/stores/batch-operations';
  import { routeForBatchOperations } from '$lib/utilities/route-for';

  export let namespace: string;
  export let jobId: string;

  let fetchKey: number = 0;
  let timeout: number;

  const handleToggleAutoRefresh = (
    event: CustomEvent<{ checked: boolean }>,
  ) => {
    if (event.detail.checked) {
      fetchKey += 1;
    } else if (timeout) {
      window.clearTimeout(timeout);
    }
  };

  const fetchBatchOperation = () =>
    describeBatchOperation({ jobId, namespace }).then((operation) => {
      if ($autoRefresh && operation.state === 'Running') {
        timeout = window.setTimeout(() => {
          fetchKey += 1;
        }, 5000);
      }

      return operation;
    });
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-row">
    <Link href={routeForBatchOperations({ namespace })} icon="chevron-left">
      {translate('batch.back-link')}
    </Link>
  </div>
  {#key fetchKey}
    {#await fetchBatchOperation() then operation}
      <BatchOperationHeader
        on:toggleAutoRefresh={handleToggleAutoRefresh}
        {operation}
      />
      <Card>
        <BatchOperationDetails {operation} />
      </Card>
      <Card>
        <BatchOperationResults {operation} />
      </Card>
    {/await}
  {/key}
</div>
