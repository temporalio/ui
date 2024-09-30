<script lang="ts">
  import { page } from '$app/stores';

  import Breadcrumbs from '$lib/holocene/breadcrumbs.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import type { RootNode } from '$lib/services/workflow-service';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import WorkflowElectron from './workflow-electron.svelte';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  export let root: RootNode;

  let allActive = false;
  let activeNode: RootNode | undefined;
  let links: { copy: string; href: string }[] = [];

  $: rootActive = allActive;
  $: currentNode =
    root?.workflow?.runId === workflow.runId &&
    root?.workflow?.id === workflow.id;

  const getPositions = (width: number, height: number, zoomLevel: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const orbits = {
      root: width / 50 / zoomLevel,
      level1: width / 16 / zoomLevel,
      level2: width / 9 / zoomLevel,
      level3: width / 6 / zoomLevel,
      level4: width / 4 / zoomLevel,
    };
    const radius = 10 / (2 * zoomLevel);
    return {
      centerX,
      centerY,
      orbits,
      radius,
    };
  };

  const onNodeMouseEnter = (node: RootNode) => {
    if (!activeNode) {
      activeNode = node;
    }
  };

  const onNodeMouseLeave = (_node: RootNode) => {
    activeNode = undefined;
  };

  const onNodeClick = (node: RootNode) => {
    if (activeNode === node) {
      activeNode = undefined;
      links = [];
    } else {
      activeNode = node;
      links = node.rootPaths.map((path) => {
        return {
          copy: node.workflow.id,
          href: routeForEventHistory({
            namespace,
            workflow: path.workflowId,
            run: path.runId,
          }),
        };
      });
    }
  };
</script>

{#if links.length}
  <Breadcrumbs {links} />
{/if}
<div class="w-full rounded-xl border-2 border-subtle bg-primary">
  <ZoomSvg
    initialZoom={0.65}
    maxZoomOut={1}
    maxZoomIn={0.25}
    let:width
    let:height
    let:zoomLevel
    class="spin"
  >
    {@const { centerX, centerY, orbits, radius } = getPositions(
      width,
      height,
      zoomLevel,
    )}
    <circle
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level1}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black opacity-50 dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level2}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black opacity-50 dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level3}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black opacity-50 dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level4}
      stroke-width="1"
      fill-opacity="0"
    />
    {#each root.children as child, i}
      <WorkflowElectron
        index={i}
        node={child}
        parent={root}
        center={{ x: centerX, y: centerY }}
        parentCenter={{ x: centerX, y: centerY }}
        {radius}
        {orbits}
        generation={1}
        {zoomLevel}
        {activeNode}
        {onNodeClick}
        {onNodeMouseEnter}
        {onNodeMouseLeave}
      />
    {/each}
    <g
      class="outline-none"
      role="button"
      tabindex="0"
      on:keypress={() => onNodeClick(root)}
      on:click={() => onNodeClick(root)}
    >
      {#if currentNode}
        <circle
          class="dark:fill-white"
          cx={centerX}
          cy={centerY}
          r={orbits.root * 1.1}
        />
      {/if}
      <circle
        class={workflow.status}
        cx={centerX}
        cy={centerY}
        r={orbits.root}
      />
      {#if root?.workflow && rootActive}
        <text
          x={centerX}
          y={centerY}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm underline"
          fill="currentColor"
        >
          <a
            href={routeForEventHistory({
              namespace,
              workflow: root?.workflow?.id,
              run: root?.workflow?.runId,
            })}
            class="hover:fill-brand dark:fill-white"
          >
            {root?.workflow?.id}
          </a>
        </text>
      {/if}
    </g>
  </ZoomSvg>
</div>

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
