<script lang="ts">
  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperations from '$lib/pages/batch-operations.svelte';

  let { params }: PageProps = $props();
  const { namespace } = $derived(params);
</script>

<PageTitle title={translate('batch.list-page-title')} />
<BatchOperations {namespace} />
