<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  let { params }: PageProps = $props();
  const { run, workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.queries-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowQuery {...params} workflowId={workflow} runId={run} />
