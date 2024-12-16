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
      'border-b border-subtle'} pl-4 hover:surface-interactive-secondary"
  >
    <p class="flex items-center gap-3">
      {#if child?.children?.length}
        <Icon name={expandAll ? 'chevron-up' : 'chevron-down'} />
      {:else}
        <span class="w-4"></span>
      {/if}
      {child.workflow.name}
    </p>
    {#if child?.children?.length && expandAll}
      <svelte:self root={child} {onNodeClick} {expandAll} />
    {/if}
  </div>
{/each}

<style lang="postcss">
  .Running {
    fill: #93bbfd;
  }

  .Started {
    fill: #92a4c3;
  }

  .Completed {
    fill: #00f37e;
  }

  .Fired {
    fill: #f8a208;
  }

  .Signaled {
    fill: #d300d8;
  }

  .Failed {
    fill: #ff4518;
  }

  .Terminated {
    fill: #fde989;
  }

  .TimedOut {
    fill: #c2570c;
  }

  .Canceled {
    fill: #fed64b;
  }
</style>
