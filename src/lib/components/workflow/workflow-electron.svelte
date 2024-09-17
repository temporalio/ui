<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import { fetchAllRootWorkflows } from '$lib/services/workflow-service';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);

  let root = { children: [], workflow };
  let container;

  onMount(async () => {
    root = await fetchAllRootWorkflows(namespace, workflow);
  });

  $: width = container?.clientWidth;
  $: height = container?.clientHeight;

  $: centerX = width / 2;
  $: centerY = height / 2;

  $: radiusRoot = width / 36;
  $: radius1 = radiusRoot * 2;
  $: radius2 = radiusRoot * 3;
  $: radius3 = radiusRoot * 4;

  const getChildPosition = (
    i: number,
    numOfChildren: number,
    radius: number,
    center = { x: centerX, y: centerY },
  ) => {
    const angleStep = (2 * Math.PI) / numOfChildren;
    const angle = i * angleStep;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    return { x, y, angle };
  };

  const getGrandChildPosition = (
    angle: number,
    radius: number,
    center = { x: centerX, y: centerY },
    i: number,
  ) => {
    const angleStep = 0.05;
    const adjustedAngle =
      i % 2 === 0 ? angle + i * angleStep : angle - i * angleStep;
    const x = center.x + radius * Math.cos(adjustedAngle);
    const y = center.y + radius * Math.sin(adjustedAngle);
    return { x, y, angle: adjustedAngle };
  };
</script>

<div
  class="flex h-[600px] w-full grow flex-col items-center justify-center xl:grow-0"
  bind:this={container}
>
  <svg {width} {height}>
    <circle
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={radius3}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={radius2}
      stroke-width="1"
      fill-opacity="0"
    />
    <circle
      class="stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={radius1}
      stroke="black"
      stroke-width="1"
      fill-opacity="0"
    />
    {#each root.children as child, i}
      {@const { x, y, angle } = getChildPosition(
        i,
        root.children.length,
        radius1,
      )}
      {#each child.children as grandChild, j}
        {@const { x: gx, y: gy } = getGrandChildPosition(
          angle,
          radius2 - radius1,
          {
            x,
            y,
          },
          j,
        )}
        <line
          x1={x}
          y1={y}
          x2={gx}
          y2={gy}
          class="stroke-black dark:stroke-white"
          stroke-width="1"
          opacity="0.5"
        />
        <circle
          class="stroke-black dark:stroke-white {grandChild.workflow.status}"
          cx={gx}
          cy={gy}
          r={6}
          stroke="black"
          stroke-width="1"
        />
      {/each}
      <line
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        class="stroke-black dark:stroke-white"
        stroke-width="1"
        opacity="0.5"
      />
      <circle
        class="stroke-black dark:stroke-white {child.workflow.status}"
        cx={x}
        cy={y}
        r={8}
        stroke="black"
        stroke-width="1"
      />
    {/each}
    <circle
      class="{workflow.status} stroke-black dark:stroke-white"
      cx={centerX}
      cy={centerY}
      r={radiusRoot}
      stroke="black"
      stroke-width="1"
    />
  </svg>
</div>

<style lang="postcss">
  .spin {
    animation: spin 60s linear infinite;
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
