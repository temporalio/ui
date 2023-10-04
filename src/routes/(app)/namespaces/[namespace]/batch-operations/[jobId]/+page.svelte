<script lang="ts">
  import { page } from '$app/stores';

  import type { PageData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import BatchOperation from '$lib/pages/batch-operation.svelte';

  $: namespace = $page.params.namespace;
  $: jobId = $page.params.jobId;

  export let data: PageData;
</script>

<PageTitle title="{translate('batch', 'describe-page-title')} | {jobId}" />
<BatchOperation operation={data.operation} {namespace} />
