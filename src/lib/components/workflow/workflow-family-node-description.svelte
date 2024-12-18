<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';

  export let root: RootNode;
  export let expandAll: boolean;
  export let generation = 1;
  export let onNodeClick: (node: RootNode) => void;
  export let activeWorkflow: WorkflowExecution | undefined = undefined;

  let expanded = false;
</script>

<div class="cursor-pointer border-subtle" class:border-r={generation === 1}>
  <button
    class="w-full select-none border-b border-subtle px-4 py-2 hover:surface-interactive-secondary"
    on:click|stopPropagation={() => (expanded = !expanded)}
  >
    <p
      class="flex items-center gap-3 truncate"
      class:ml-6={!root?.children?.length}
    >
      {#if root?.children?.length}
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="-mr-1" />
      {/if}
      <span class="h-4 w-4 {root.workflow.status}"></span>{root.workflow.name}
    </p>
  </button>
  {#if root?.children?.length && expanded}
    <div class="pl-4">
      <WorkflowFamilyNodeDescriptionTree
        {root}
        {onNodeClick}
        {expandAll}
        {activeWorkflow}
        generation={generation + 1}
      />
    </div>
  {/if}
</div>

<style lang="postcss">
  .Running {
    background-color: #93bbfd;
  }

  .Started {
    background-color: #92a4c3;
  }

  .Completed {
    background-color: #00f37e;
  }

  .Fired {
    background-color: #f8a208;
  }

  .Signaled {
    background-color: #d300d8;
  }

  .Failed {
    background-color: #ff4518;
  }

  .Terminated {
    background-color: #fde989;
  }

  .TimedOut {
    background-color: #c2570c;
  }

  .Canceled {
    background-color: #fed64b;
  }

  .ContinuedAsNew {
    background-color: #e2d5fe;
  }
</style>
