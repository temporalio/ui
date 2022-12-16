<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
  $: isCloud = $page.stuff?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle title={`Query | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled={!isCloud} signalEnabled={!isCloud}>
  <WorkflowQuery />
</WorkflowRunLayout>
