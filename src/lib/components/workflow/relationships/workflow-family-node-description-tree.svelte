<script lang="ts">
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescription from './workflow-family-node-description.svelte';

  type Props = {
    root: RootNode;
    expandAll: boolean;
    onNodeClick: (node: RootNode, generation: number) => void;
    activeWorkflow?: WorkflowExecution | undefined;
    generation?: number;
    openRuns: Map<number, string>;
  };

  let {
    root,
    expandAll,
    onNodeClick,
    activeWorkflow = undefined,
    generation = 1,
    openRuns,
  }: Props = $props();
</script>

{#each root?.children as child}
  <WorkflowFamilyNodeDescription
    root={child}
    {expandAll}
    {onNodeClick}
    {activeWorkflow}
    {generation}
    {openRuns}
  />
{/each}
