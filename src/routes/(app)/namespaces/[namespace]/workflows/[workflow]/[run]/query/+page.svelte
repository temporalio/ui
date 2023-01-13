<script lang="ts">
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Query | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout
  cancelEnabled={workflowCancelEnabled($page.data.settings)}
  signalEnabled={workflowSignalEnabled($page.data.settings)}
  terminateEnabled={workflowTerminateEnabled($page.data.settings)}
  resetEnabled={workflowResetEnabled($page.data.settings)}
>
  <WorkflowQuery />
</WorkflowRunLayout>
