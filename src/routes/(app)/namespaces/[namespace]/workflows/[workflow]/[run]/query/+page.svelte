<script lang="ts">
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Query | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout
  cancelEnabled={!$settings.workflowCancelDisabled}
  signalEnabled={!$settings.workflowSignalDisabled}
  terminateEnabled={!$settings.workflowTerminateDisabled}
>
  <WorkflowQuery />
</WorkflowRunLayout>
