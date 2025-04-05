<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperations from '$lib/pages/batch-operations.svelte';

  $: namespace = $page.params.namespace;
</script>

<PageTitle title={translate('batch.list-page-title')} />
<BatchOperations {namespace} />
