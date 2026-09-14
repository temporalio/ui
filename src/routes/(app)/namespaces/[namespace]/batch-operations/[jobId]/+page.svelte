<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperation from '$lib/pages/batch-operation.svelte';

  const namespace = $derived(page.params.namespace);
  const jobId = $derived(page.params.jobId);
</script>

<PageTitle title="{translate('batch.describe-page-title')} | {jobId}" />
<BatchOperation {jobId} {namespace} />
