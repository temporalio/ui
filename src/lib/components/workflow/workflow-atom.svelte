<script context="module" lang="ts">
  import type { WorkflowExecution } from '$lib/types/workflows';

  export type RootNode = {
    children: RootNode[];
    workflow: WorkflowExecution;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { fetchAllRootWorkflows } from '$lib/services/workflow-service';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowElectron from './workflow-electron.svelte';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  let root: RootNode = { children: [], workflow };

  onMount(async () => {
    root = await fetchAllRootWorkflows(namespace, workflow);
  });

  const getPositions = (width: number, height: number, zoomLevel: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const orbits = {
      root: width / 40 / zoomLevel,
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
</script>

<div class="w-full rounded-xl border-2 border-subtle bg-primary">
  <ZoomSvg
    initialZoom={0.55}
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
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level2}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={orbits.level3}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black dark:stroke-white"
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
        {radius}
        {orbits}
        generation={1}
        {zoomLevel}
      />
    {/each}
    <circle class={workflow.status} cx={centerX} cy={centerY} r={orbits.root} />
  </ZoomSvg>
</div>

<style lang="postcss">
  .spin {
    animation: spin 500s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

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
