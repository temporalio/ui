<script lang="ts">
  import { page } from '$app/stores';

  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescriptionDetails from './workflow-family-node-description-details.svelte';
  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';

  export let root: RootNode;
  export let expandAll: boolean;
  export let generation = 0;
  export let onNodeClick: (node: RootNode, generation: number) => void;
  export let activeWorkflow: WorkflowExecution | undefined = undefined;
  export let openRuns: Map<number, string>;

  $: ({ namespace, workflow, run } = $page.params);
  $: expanded =
    expandAll ||
    openRuns.get(generation) === root.workflow.runId ||
    generation === 0;
  $: isCurrent = root.workflow.id === workflow && root.workflow.runId === run;
  $: isActive = root.workflow.runId === activeWorkflow?.runId;
  $: isRootWorkflow = generation === 0;

  const onClick = () => {
    onNodeClick(root, generation);
  };
</script>

<div class="w-full">
  <button
    class="relative flex w-full select-none border-subtle {isActive &&
      'surface-interactive'} {isCurrent &&
      !isActive &&
      'surface-subtle'} items-center gap-1 px-2 py-1 lg:py-2 {!isActive &&
      'hover:surface-interactive-secondary'}"
    class:border-l={!isRootWorkflow && !isActive}
    on:click|stopPropagation={onClick}
  >
    {#if !isRootWorkflow && !isActive}
      <div
        class="absolute left-0 top-[25%] h-[1px] w-3 bg-subtle lg:top-[50%] lg:w-6"
      ></div>
    {/if}
    <div class="flex w-full items-center gap-3 pr-2 text-sm">
      <WorkflowFamilyNodeDescriptionDetails
        workflow={root.workflow}
        {namespace}
        {isRootWorkflow}
        {isActive}
        children={root.children?.length}
        {expanded}
      />
    </div>
  </button>
  {#if expanded}
    <div class="pl-4">
      {#if root?.children?.length}
        <WorkflowFamilyNodeDescriptionTree
          {root}
          {onNodeClick}
          {expandAll}
          {activeWorkflow}
          generation={generation + 1}
          {openRuns}
        />
      {/if}
    </div>
  {/if}
</div>
