<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Query | ${$workflowRun?.workflow?.id}`}
  url={$page.url.href}
/>
<WorkflowQuery />
