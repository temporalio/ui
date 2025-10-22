<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import { workflowComparison } from '$lib/stores/workflow-comparison';

  import WorkflowComparisonPanel from './workflow-comparison-panel.svelte';

  const { namespace } = $derived($page.params);
  const originalWorkflow = $derived($workflowComparison.originalWorkflow);
  const comparisons = $derived($workflowComparison.comparisons);

  $inspect('comparisons: ', comparisons);
  const handleExitComparison = () => {
    workflowComparison.exitComparison();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('compare');
    goto(currentUrl.toString(), { replaceState: true, noScroll: true });
  };
</script>

<div class="flex h-full flex-col">
  <div
    class="flex items-center justify-between border-b border-subtle bg-secondary px-4 py-2"
  >
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">Comparison Mode</h2>
      <span class="text-sm text-secondary">
        ({comparisons.length + 1} workflow{comparisons.length > 0 ? 's' : ''})
      </span>
    </div>
    <Button
      leadingIcon="close"
      variant="ghost"
      size="sm"
      on:click={handleExitComparison}
    />
  </div>

  <div class="flex grow">
    <WorkflowComparisonPanel
      {namespace}
      workflowId={originalWorkflow.workflowId}
      runId={originalWorkflow.runId}
      index={0}
    />
    {#each comparisons as comparison, index (comparison.runId)}
      <WorkflowComparisonPanel
        {namespace}
        workflowId={comparison.workflowId}
        runId={comparison.runId}
        resetFromEventId={comparison.resetFromEventId}
        index={index + 1}
      />
    {/each}
  </div>
</div>
