<script lang="ts">
  import { page } from '$app/stores';

  import type { RootNode } from '$lib/services/workflow-service';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let index: number;
  export let center: { x: number; y: number };
  export let node: RootNode;
  export let parent: RootNode;
  export let parentCenter: { x: number; y: number };
  export let parentAngle = 0;
  export let radius: number;
  export let orbits: { [key: string]: number };
  export let generation: number;
  export let zoomLevel: number;
  export let allActive = false;
  export let onNodeClick: (node: RootNode) => void;

  $: ({ namespace, workflow: id, run: runId } = $page.params);

  $: numberOfSiblings = parent?.children?.length;
  $: orbit = orbits[`level${generation}`];
  $: ({ x, y, angle } = getPosition({
    index,
    numberOfSiblings,
    orbit,
    center,
  }));
  $: currentNode = node.workflow.runId === runId && node.workflow.id === id;

  $: active = allActive;

  const getPosition = ({
    index,
    numberOfSiblings,
    orbit,
    center,
  }: {
    index: number;
    numberOfSiblings: number;
    orbit: number;
    center: { x: number; y: number };
  }) => {
    let angleStep = (2 * Math.PI) / numberOfSiblings;
    let angle = index * angleStep;

    if (generation > 1) {
      angleStep = 0.025 / zoomLevel;
      angle =
        index % 2 === 0
          ? parentAngle + index * angleStep
          : parentAngle - index * angleStep;
    }
    const x = center.x + orbit * Math.cos(angle);
    const y = center.y + orbit * Math.sin(angle);
    return { x, y, angle };
  };
</script>

{#if generation + 1 < 5}
  {#each node.children as child, i}
    <svelte:self
      index={i}
      node={child}
      {center}
      parent={node}
      parentCenter={{ x, y }}
      parentAngle={angle}
      {radius}
      {orbits}
      generation={generation + 1}
      {zoomLevel}
      {allActive}
      {onNodeClick}
    />
  {/each}
{/if}
<line
  x1={x}
  y1={y}
  x2={parentCenter.x}
  y2={parentCenter.y}
  class="stroke-black dark:stroke-white"
  stroke-width="2"
  opacity="0.35"
  stroke-dasharray={node.workflow.status === 'Running' ? '5' : 'none'}
/>
<g
  class="outline-none"
  role="button"
  tabindex="0"
  on:keypress={() => onNodeClick(node)}
  on:click={() => onNodeClick(node)}
>
  {#if currentNode}
    <circle class="dark:fill-white" cx={x} cy={y} r={radius * 1.5} />
  {/if}
  <circle
    class="{node.workflow.status} hover:cursor-pointer"
    cx={x}
    cy={y}
    r={radius}
  />
</g>

{#if active}
  <text
    x={x < center.x ? x - 1.25 * radius : x + 1.25 * radius}
    y={y + radius / 3}
    text-anchor={x < center.x ? 'end' : 'start'}
    dominant-baseline="start"
    font-size="14px"
    class="text-sm underline"
    fill="currentColor"
  >
    <a
      href={routeForEventHistory({
        namespace,
        workflow: node.workflow.id,
        run: node.workflow.runId,
      })}
      class="hover:fill-brand dark:fill-white"
    >
      {node.workflow.id}
    </a>
  </text>
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
