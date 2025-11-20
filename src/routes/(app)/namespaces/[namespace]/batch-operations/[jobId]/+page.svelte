<script lang="ts">
  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperation from '$lib/pages/batch-operation.svelte';

  let { params }: PageProps = $props();
  const { namespace, jobId } = $derived(params);
</script>

<PageTitle title="{translate('batch.describe-page-title')} | {jobId}" />
<BatchOperation {jobId} {namespace} />
