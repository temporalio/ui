<script lang="ts">
  import { page } from '$app/stores';

  import type { PageData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperations from '$lib/pages/batch-operations.svelte';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';

  $: namespace = $page.params.namespace;
  export let data: PageData;
</script>

<PageTitle title={translate('batch', 'list-page-title')} />
{#if $inProgressBatchOperation}
  <Alert
    icon="info"
    intent="info"
    title={translate('batch', 'max-concurrent-alert-title')}
  >
    {translate('batch', 'max-concurrent-alert-description')}
  </Alert>
{/if}
<BatchOperations operations={data.operations} {namespace} />
