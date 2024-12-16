<script lang="ts">
  import type { RootNode } from '$lib/services/workflow-service';
  // import { workflowRun } from '$lib/stores/workflow-run';

  // $: ({ workflow } = $workflowRun);

  export let root: RootNode;
  export let width: number;
  export let height: number;
  export let zoomLevel: number;
  export let rootX = 0;
  export let rootY = 0;
  export let generation = 1;

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

  const getPositions = (
    width: number,
    height: number,
    rootX: number,
    rootY: number,
  ) => {
    const x = rootX || width / 2;
    const y = rootY || height / 5;
    const radius = 20;
    return {
      x,
      y,
      radius,
    };
  };

  $: ({ x, y, radius } = getPositions(width, height, rootX, rootY));

  $: getPosition = (index: number) => {
    const childY = y + y / 1.5 / generation;

    const getX = () => {
      const numberOfSiblings = root.children?.length;
      if (numberOfSiblings === 1) return x;
      const expandFactor = (radius * (6 - generation * 2)) / zoomLevel;
      if (numberOfSiblings % 2 === 0) {
        return x + (index - numberOfSiblings / 2) * expandFactor;
      } else {
        const middleIndex = numberOfSiblings / 2 - 0.5;
        if (index === middleIndex) return x;
        return x + (index - middleIndex) * expandFactor;
      }
    };

    return { childX: getX(), childY };
  };

  const clickNode = (node) => {
    showChildren[node.workflow.id] =
      showChildren?.[node.workflow.id] === undefined
        ? true
        : !showChildren[node.workflow.id];
    onNodeClick(node);
  };
</script>

{#each root?.children as child, index}
  {@const { childX, childY } = getPosition(index)}
  {#if child.children.length && showChildren[child.workflow.id]}
    <svelte:self
      root={child}
      {zoomLevel}
      rootX={childX}
      rootY={childY}
      generation={generation + 1}
      {onNodeClick}
      {expandAll}
    />
  {/if}
  <line
    x1={x}
    y1={y}
    x2={childX}
    y2={childY}
    class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
    stroke-width="2"
    stroke-opacity="0.15"
    stroke-dasharray={child.workflow.status === 'Running' ? '5' : 'none'}
  />
  <rect
    class={child.workflow.status}
    x={childX - radius / 2}
    y={childY - radius / 2}
    cx={radius / 2}
    cy={radius / 2}
    width={radius}
    height={radius}
    fill-opacity="1"
    on:click={() => clickNode(child)}
    cursor={child.children?.length ? 'pointer' : 'default'}
  />
  {#if child?.children?.length}
    <text
      x={childX}
      y={childY - radius}
      class="text-center text-xs"
      fill="currentColor"
      text-anchor="middle"
      font-weight="500">{child.children.length}</text
    >
  {/if}
{/each}
{#if generation === 1}
  <rect
    class={root.workflow.status}
    x={x - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    cx={radius / 2}
    cy={radius / 2}
    fill-opacity="1"
    cursor="pointer"
    on:click={() => clickNode(root)}
  />
  {#if root?.children?.length}
    <text
      {x}
      y={y - radius}
      class="text-center text-xs"
      fill="currentColor"
      text-anchor="middle"
      font-weight="500">{root.children.length}</text
    >
  {/if}
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
