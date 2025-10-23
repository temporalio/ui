<script lang="ts">
  import { onDestroy } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import WorkflowSimpleHistory from '$lib/layouts/workflow-simple-history.svelte';
  import { workflowComparison } from '$lib/stores/workflow-comparison';

  const comparisons = $derived($workflowComparison.comparisons);

  const handleExitComparison = () => {
    workflowComparison.exitComparison();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('compare');
    goto(currentUrl.toString(), { replaceState: true, noScroll: true });
  };

  onDestroy(() => {
    workflowComparison.exitComparison();
  });

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);
</script>

<div class="relative flex h-full flex-col overflow-auto pt-12">
  <div
    class="sticky left-0 top-0 flex items-center justify-between border-b border-subtle bg-secondary px-4 py-2"
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

  <div class="relative flex grow bg-subtle">
    <div class="sticky left-0 top-0 z-20">
      <WorkflowSimpleHistory {namespace} {workflowId} {runId} index={0} />
    </div>
    {#each comparisons as comparison, index (comparison.runId)}
      <WorkflowSimpleHistory
        {namespace}
        {workflowId}
        runId={comparison.runId}
        index={index + 1}
      />
    {/each}
  </div>
</div>
