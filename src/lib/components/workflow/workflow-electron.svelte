<script lang="ts">
  import { page } from '$app/stores';

  import type { RootNode } from './workflow-atom.svelte';
  export let index: number;
  export let center: { x: number; y: number };
  export let node: RootNode;
  export let parent: RootNode;
  export let parentCenter: { x: number; y: number } = center;
  export let parentAngle = 0;
  export let radius: number;
  export let orbits: { [key: string]: number };
  export let generation: number;
  export let zoomLevel: number;

  $: ({ workflow: id, run: runId } = $page.params);

  $: numberOfSiblings = parent?.children?.length;

  $: orbit = orbits[`level${generation}`];
  $: ({ x, y, angle } = getPosition({
    index,
    numberOfSiblings,
    orbit,
    center,
  }));
  $: activeNode = node.workflow.runId === runId && node.workflow.id === id;
  $: r = activeNode ? radius * 2 : radius;

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
  opacity="0.5"
  stroke-dasharray={node.workflow.status === 'Running' ? '5' : 'none'}
/>
<circle class={node.workflow.status} cx={x} cy={y} {r} />

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
