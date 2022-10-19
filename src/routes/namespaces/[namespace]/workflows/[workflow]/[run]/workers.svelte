<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Workers | ${$workflowRun?.workflow?.id}`}
  url={$page.url.href}
/>
<WorkflowWorkers />
