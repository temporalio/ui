<script lang="ts">
  import BatchOperationsTable from '$lib/components/batch-operations/table.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { listBatchOperations } from '$lib/services/batch-service';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();
</script>

<h1>{translate('batch.list-page-title')}</h1>
{#await listBatchOperations(namespace)}
  <Loading />
{:then { operations }}
  {#if $inProgressBatchOperation}
    <Alert
      icon="info"
      intent="info"
      title={translate('batch.max-concurrent-alert-title')}
    >
      {translate('batch.max-concurrent-alert-description')}
    </Alert>
  {/if}
  <BatchOperationsTable {operations} {namespace} />
{/await}
