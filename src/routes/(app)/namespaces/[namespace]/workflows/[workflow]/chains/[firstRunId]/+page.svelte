<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { WorkflowExecutionChain } from '$lib/pages/workflow-execution-chain';

  const namespace = $derived(page.params.namespace);
  const workflowId = $derived(page.params.workflow);
  const firstRunId = $derived(page.params.firstRunId);
</script>

<PageTitle
  title="Workflow Execution Chain | {workflowId}"
  url={page.url.href}
/>

<WorkflowExecutionChain {namespace} {workflowId} {firstRunId} />
