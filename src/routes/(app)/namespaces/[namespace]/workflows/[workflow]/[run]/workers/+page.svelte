<script lang="ts">
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Workers | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout
  cancelEnabled={workflowCancelEnabled($page.data.settings)}
  signalEnabled={workflowSignalEnabled($page.data.settings)}
  terminateEnabled={workflowTerminateEnabled($page.data.settings)}
>
  <WorkflowWorkers />
</WorkflowRunLayout>
