<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';
  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow: workflowId } = $page.params);
  $: ({ workers, workflow } = $workflowRun);
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={$page.url.href}
/>
<WorkflowPaddedLayout>
  <WorkflowWorkers {workers} taskQueue={workflow?.taskQueue} />
</WorkflowPaddedLayout>
