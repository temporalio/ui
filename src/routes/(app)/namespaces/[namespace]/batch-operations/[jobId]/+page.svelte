<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperation from '$lib/pages/batch-operation.svelte';

  $: namespace = $page.params.namespace;
</script>

<PageTitle title={translate('batch', 'describe-page-title')} />
<BatchOperation {namespace} />
