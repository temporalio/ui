<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowCompatibilityError from '$lib/components/workflow/workflow-compatibility-error.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';
  import TaskQueueWorkers from '$lib/pages/task-queue-workers.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow: workflowId } = $page.params);
  $: ({ workers, workflow } = $workflowRun);

  $: useVersioning = !!workflow?.mostRecentWorkerVersionStamp?.useVersioning;
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={$page.url.href}
/>
<WorkflowPaddedLayout>
  <TaskQueueWorkers
    {workers}
    taskQueue={workflow?.taskQueue}
    {useVersioning}
    let:compatibility
  >
    <WorkflowCompatibilityError {compatibility} />
  </TaskQueueWorkers>
</WorkflowPaddedLayout>
