<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueWorkerInsights from '$lib/components/task-queue/worker-insights.svelte';
  import NoWorkersPollingAlert from '$lib/components/workers/no-workers-polling-alert.svelte';
  import { translate } from '$lib/i18n/translate';

  const workflowId = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={page.url.href}
/>
<NoWorkersPollingAlert />
<TaskQueueWorkerInsights />
