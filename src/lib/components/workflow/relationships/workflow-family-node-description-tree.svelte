<script lang="ts">
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescription from './workflow-family-node-description.svelte';

  export let root: RootNode;
  export let expandAll: boolean;
  export let onNodeClick: (node: RootNode, generation: number) => void;
  export let activeWorkflow: WorkflowExecution | undefined = undefined;
  export let generation = 1;
  export let openRuns: Map<number, string>;
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
