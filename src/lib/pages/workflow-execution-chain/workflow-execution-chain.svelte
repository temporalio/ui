<script lang="ts">
  import WorkflowExecutionChainContent, {
    type WorkflowExecutionChainProps,
  } from './workflow-execution-chain-content.svelte';

  let { namespace, workflowId, firstRunId }: WorkflowExecutionChainProps =
    $props();

  const identityKey = $derived(
    JSON.stringify({ namespace, workflowId, firstRunId }),
  );
</script>

{#key identityKey}
  <WorkflowExecutionChainContent {namespace} {workflowId} {firstRunId} />
{/key}
