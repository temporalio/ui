<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  const workflow = $page.params.workflow;
  $: isCloud = $page.stuff?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle title={`Stack Trace | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled={!isCloud} signalEnabled={!isCloud}>
  <WorkflowStackTrace />
</WorkflowRunLayout>
