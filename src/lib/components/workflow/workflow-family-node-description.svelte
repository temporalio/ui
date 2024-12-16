<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { RootNode } from '$lib/services/workflow-service';
  // import { workflowRun } from '$lib/stores/workflow-run';

  // $: ({ workflow } = $workflowRun);

  export let root: RootNode;
  export let expandAll: boolean;
  export let onNodeClick: (node: RootNode) => void;

  let showChildren = {};

  const setAllExpanded = (expandAll: boolean) => {
    root.children.forEach((child) => {
      showChildren[child.workflow.id] = expandAll;
    });
  };

  $: setAllExpanded(expandAll);

  // $: currentNode =
  //   root?.workflow?.runId === workflow.runId &&
  //   root?.workflow?.id === workflow.id;

  $: {
    if (root.children) {
      console.log('root.children: ', root.children);
    }
  }
</script>

{#each root?.children as child}
  <div
    class="cursor-pointer {child?.children?.length &&
      'border-b border-subtle'} pl-4"
  >
    <p
      class="flex items-center gap-3 px-1 hover:surface-interactive-secondary"
      class:ml-6={!child?.children?.length}
    >
      {#if child?.children?.length}
        <Icon name={expandAll ? 'chevron-up' : 'chevron-down'} />
      {/if}
      <span class="h-4 w-4 {child.workflow.status}"></span>{child.workflow.name}
    </p>
    {#if child?.children?.length && expandAll}
      <svelte:self root={child} {onNodeClick} {expandAll} />
    {/if}
  </div>
{/each}

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
</style>
