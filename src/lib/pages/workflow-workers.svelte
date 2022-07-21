<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import PageTitle from '$lib/holocene/page-title.svelte';
  import WorkersList from '$lib/components/workers-list.svelte';

  const { workers, workflow } = $workflowRun;
</script>

<PageTitle title={`Workers | ${workflow.id}`} url={$page.url.href} />
<WorkersList taskQueue={workflow.taskQueue} {workers} />
