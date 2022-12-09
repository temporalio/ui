<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Workers | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled signalEnabled>
  <WorkflowWorkers />
</WorkflowRunLayout>
