<script lang="ts">
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Stack Trace | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout
  cancelEnabled={!$settings.workflowCancelDisabled}
  signalEnabled={!$settings.workflowSignalDisabled}
  terminateEnabled={!$settings.workflowTerminateDisabled}
>
  <WorkflowStackTrace />
</WorkflowRunLayout>
