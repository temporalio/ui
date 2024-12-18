<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import WorkflowFamilyNodeDescriptionDetails from './workflow-family-node-description-details.svelte';
  import WorkflowFamilyNodeDescriptionTree from './workflow-family-node-description-tree.svelte';

  export let root: RootNode;
  export let expandAll: boolean;
  export let generation = 1;
  export let onNodeClick: (node: RootNode) => void;
  export let activeWorkflow: WorkflowExecution | undefined = undefined;
  export let openRuns: Record<string, boolean> = {};

  $: ({ namespace, workflow, run } = $page.params);
  $: expanded = expandAll || openRuns[root.workflow.runId];
  $: isActive = root.workflow.id === workflow && root.workflow.runId === run;

  const onClick = () => {
    onNodeClick(root);
  };
</script>

<div class="cursor-pointer border-subtle" class:border-r={generation === 1}>
  <button
    class="flex w-full select-none items-center justify-between gap-1 border-b border-subtle px-2 py-1 hover:surface-interactive-secondary"
    class:bg-blue-700={isActive}
    class:text-white={isActive}
    on:click|stopPropagation={onClick}
  >
    <div
      class="flex w-full items-center gap-3 text-sm"
      class:ml-6={!root?.children?.length}
    >
      {#if root?.children?.length}
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          class="-mr-1 w-4 flex-shrink-0"
        />
      {/if}
      <WorkflowStatus status={root.workflow.status} />
      <div class="shrink-1 flex flex-col items-start text-left leading-4">
        <p>{root.workflow.name}</p>
        <p>{root.workflow.id}</p>
      </div>
    </div>
    <Link
      href={routeForEventHistory({
        namespace,
        workflow: root.workflow.id,
        run: root.workflow.runId,
      })}
      newTab
      icon="external-link"
    ></Link>
  </button>
  {#if expanded}
    <WorkflowFamilyNodeDescriptionDetails workflow={root.workflow} />
    {#if root?.children?.length}
      <div class="pl-4">
        <WorkflowFamilyNodeDescriptionTree
          {root}
          {onNodeClick}
          {expandAll}
          {activeWorkflow}
          generation={generation + 1}
          {openRuns}
        />
      </div>
    {/if}
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
