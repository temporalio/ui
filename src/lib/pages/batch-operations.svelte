<script lang="ts">
  import BatchOperationsTable from '$lib/components/batch-operations/table.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { createTranslate } from '$lib/i18n/translate';
  import { listBatchOperations } from '$lib/services/batch-service';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';

  export let namespace: string;
  const t = createTranslate('batch');
</script>

<h1 class="text-2xl">{t('list-page-title')}</h1>
{#await listBatchOperations(namespace)}
  <Loading />
{:then { operations }}
  {#if $inProgressBatchOperation}
    <Alert icon="info" intent="info" title={t('max-concurrent-alert-title')}>
      {t('max-concurrent-alert-description')}
    </Alert>
  {/if}
  <BatchOperationsTable {operations} {namespace} />
{/await}
