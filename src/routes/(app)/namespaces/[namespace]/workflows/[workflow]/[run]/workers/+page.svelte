<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { workflowRun } from '$lib/stores/workflow-run';

  const historyController = getWorkflowHistoryController();
  const { namespace, workflow: workflowId } = $derived(page.params);
  const taskQueue = $derived($workflowRun?.workflow?.taskQueue ?? '');
  const workerHeartbeatsEnabled = $derived(
    !!page.data.namespace.namespaceInfo?.capabilities?.workerHeartbeats,
  );
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={page.url.href}
/>
<WorkersTable
  {namespace}
  {taskQueue}
  sdkInfo={historyController.history.sdkInfo}
  useFallback={!workerHeartbeatsEnabled}
  onCount={(count) => ($workflowRun.workerCount = count)}
/>
