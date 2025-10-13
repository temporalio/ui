<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import WorkflowHistoryComparisonLayout from '$lib/layouts/workflow-history-comparison-layout.svelte';
  import { workflowComparison } from '$lib/stores/workflow-comparison';

  import WorkflowComparisonPanel from './workflow-comparison-panel.svelte';

  const { namespace } = $derived($page.params);
  const originalWorkflow = $derived($workflowComparison.originalWorkflow);
  const comparisons = $derived($workflowComparison.comparisons);

  const handleExitComparison = () => {
    workflowComparison.exitComparison();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('compare');
    goto(currentUrl.toString(), { replaceState: true, noScroll: true });
  };
</script>

<div class="comparison-container flex h-full flex-col">
  <div
    class="bg-surface flex items-center justify-between border-b border-subtle p-4"
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

  <div class="comparison-grid flex-1 overflow-auto">
    <div class="comparison-panel border-r border-subtle">
      <div class="panel-header z-10 bg-secondary p-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Original</h3>
          {#if originalWorkflow}
            <p class="truncate text-xs text-secondary">
              {originalWorkflow.runId}
            </p>
          {/if}
        </div>
      </div>
      <div class="panel-content">
        <WorkflowHistoryComparisonLayout />
      </div>
    </div>

    {#each comparisons as comparison, index (comparison.runId)}
      <WorkflowComparisonPanel
        {namespace}
        workflowId={comparison.workflowId}
        runId={comparison.runId}
        resetFromEventId={comparison.resetFromEventId}
        {index}
      />
    {/each}
  </div>
</div>

<style lang="postcss">
  .comparison-container {
    @apply h-full;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 0;
  }

  .comparison-panel {
    @apply flex flex-col;

    min-width: 600px;
  }

  .panel-header {
    @apply border-b border-subtle;
  }

  .panel-content {
    @apply flex-1 overflow-auto;
  }
</style>
