<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Stack Trace | ${$workflowRun?.workflow?.id}`}
  url={$page.url.href}
/>
<WorkflowStackTrace />
