<script lang="ts">
  import type { RootNode } from '$lib/services/workflow-service';
  // import { workflowRun } from '$lib/stores/workflow-run';
  // import { fade, fly } from 'svelte/transition';

  // $: ({ workflow } = $workflowRun);

  export let root: RootNode;
  export let width: number;
  export let height: number;
  export let zoomLevel: number;
  export let rootX = 0;
  export let rootY = 0;
  export let generation = 1;

  // $: currentNode =
  //   root?.workflow?.runId === workflow.runId &&
  //   root?.workflow?.id === workflow.id;

  const getPositions = (
    width: number,
    height: number,
    zoomLevel: number,
    rootX: number,
    rootY: number,
  ) => {
    const x = rootX || width / 2;
    const y = rootY || height / 3;
    const radius = 10 / (2 * zoomLevel);
    return {
      x,
      y,
      radius,
    };
  };

  $: ({ x, y, radius } = getPositions(width, height, zoomLevel, rootX, rootY));
</script>

{#each root.children as child, index}
  {@const childX = (width / root.children.length) * index + radius}
  {@const childY = y + y / 2 / generation}
  {#if child.children.length}
    <svelte:self
      root={child}
      {zoomLevel}
      rootX={childX}
      rootY={childY}
      generation={generation + 1}
    />
  {/if}
  <line
    x1={x}
    y1={y}
    x2={childX}
    y2={childY}
    class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
    stroke-width="2"
    stroke-dasharray={child.workflow.status === 'Running' ? '5' : 'none'}
  />
  <circle
    class="stroke-black dark:stroke-white {child.workflow.status}"
    cx={childX}
    cy={childY}
    r={radius}
    stroke-width="1"
    fill-opacity="1"
  />
{/each}
{#if generation === 1}
  <circle
    class="stroke-black dark:stroke-white {root.workflow.status}"
    cx={x}
    cy={y}
    r={radius * 2}
    stroke-width="1"
    fill-opacity="1"
  />
{/if}

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

  .Failed,
  .Terminated {
    fill: #ff4518;
  }

  .TimedOut {
    fill: #c2570c;
  }

  .Canceled {
    fill: #fed64b;
  }
</style>
