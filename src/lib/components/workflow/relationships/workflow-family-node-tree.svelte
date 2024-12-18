<script lang="ts">
  import type { RootNode } from '$lib/services/workflow-service';

  export let root: RootNode;
  export let width: number;
  export let height: number;
  export let zoomLevel: number;
  export let rootX = 0;
  export let rootY = 0;
  export let generation = 1;
  export let openRuns: Record<string, boolean> = {};
  export let expandAll: boolean;
  export let onNodeClick: (node: RootNode) => void;

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
    const childY = y + 4 * radius;

    const getX = () => {
      const numberOfSiblings = root.children?.length;
      if (numberOfSiblings === 1) return x;
      const expandFactor = (radius * (6 - generation * 2)) / zoomLevel;
      if (numberOfSiblings % 2 === 0) {
        return (
          x + (index - numberOfSiblings * 0.5) * expandFactor + expandFactor / 2
        );
      } else {
        const middleIndex = numberOfSiblings / 2 - 0.5;
        if (index === middleIndex) return x;
        return x + (index - middleIndex) * expandFactor;
      }
    };

    return { childX: getX(), childY };
  };

  const nodeClick = (e, node: RootNode) => {
    e.stopPropagation();
    onNodeClick(node);
  };

  $: isExpanded = (node: RootNode) => {
    return openRuns[node.workflow.runId];
  };
</script>

{#if root?.children.length}
  <line
    x1={getPosition(0).childX}
    y1={getPosition(0).childY - 1.5 * radius}
    x2={getPosition(root?.children.length - 1).childX}
    y2={getPosition(0).childY - 1.5 * radius}
    class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
    stroke-width="2"
    stroke-opacity="0.15"
  />
{/if}
{#each root?.children as child, index}
  {@const { childX, childY } = getPosition(index)}
  {#if child.children.length && isExpanded(child)}
    <svelte:self
      root={child}
      {width}
      {height}
      {zoomLevel}
      rootX={childX}
      rootY={childY}
      generation={generation + 1}
      {expandAll}
      {openRuns}
      {onNodeClick}
    />
  {/if}
  <line
    x1={childX}
    y1={childY - 1.5 * radius}
    x2={childX}
    y2={childY}
    class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
    stroke-width="2"
    stroke-opacity="0.15"
    stroke-dasharray={child.workflow.status === 'Running' ? '5' : 'none'}
  />
  <g role="button" on:click={(e) => nodeClick(e, child)}>
    {#if child?.children?.length && isExpanded(child)}
      <line
        x1={childX}
        y1={childY}
        x2={childX}
        y2={childY + 2.5 * radius}
        class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
        stroke-width="2"
        stroke-opacity="0.15"
      />
    {/if}
    <rect
      class={child.workflow.status}
      x={childX - radius / 2}
      y={childY - radius / 2}
      cx={radius / 2}
      cy={radius / 2}
      width={radius}
      height={radius}
      fill-opacity="1"
      cursor={child.children?.length ? 'pointer' : 'default'}
    />
    {#if child?.children?.length}
      <text
        x={childX}
        y={childY + 1.25 * radius}
        class="text-center text-xs"
        fill="currentColor"
        text-anchor="middle"
        font-weight="500">{child.children.length}</text
      >
    {/if}
  </g>
{/each}

{#if generation === 1}
  {#if root?.children?.length}
    <line
      x1={x}
      y1={y}
      x2={x}
      y2={y + 2.5 * radius}
      class="stroke-black transition-all duration-300 ease-in-out dark:stroke-white"
      stroke-width="2"
      stroke-opacity="0.15"
    />
  {/if}
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
    on:click={(e) => nodeClick(e, root)}
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

  .ContinuedAsNew {
    fill: #e2d5fe;
  }
</style>
