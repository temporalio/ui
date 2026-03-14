<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import NoWorkersPollingAlert from '$lib/components/workers/no-workers-polling-alert.svelte';
  import WorkersTable from '$lib/components/workers/workers-table/task-queue-workers-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace, workflow: workflowId } = $derived(page.params);
  const taskQueue = $derived($workflowRun?.workflow?.taskQueue);
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={page.url.href}
/>
<NoWorkersPollingAlert />
<WorkersTable {namespace} {taskQueue} />
