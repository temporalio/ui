<script lang="ts">
  import { onMount } from 'svelte';

  import type { Deployment } from './deployments';
  import { TimelineConfig } from '../constants';

  import DeploymentAxis from './deployment-axis.svelte';
  import DeploymentGraphRow from './deployment-graph-row.svelte';
  import DeploymentInterval from './deployment-interval.svelte';

  export let deployment: Deployment;
  export let x = 0;
  export let y = 0;

  const { height } = TimelineConfig;

  let canvasContainer;
  const canvasWidth: number = 8000;

  const canvasPadding = 200;
  $: canvasHeight = (deployment?.length + 1) * height + canvasPadding;

  onMount(() => {
    scollToNow();
  });

  const scollToNow = () => {
    if (canvasContainer && window) {
      canvasContainer.scrollLeft = canvasWidth / 2 - window.innerWidth / 2;
    }
  };
</script>

<DeploymentInterval
  let:startTime
  let:endTime
  let:duration
  let:now
  onNowClick={scollToNow}
>
  <div
    class="surface-black h-auto h-auto w-full overflow-auto rounded pt-20"
    bind:this={canvasContainer}
  >
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
    >
      <DeploymentAxis
        {canvasWidth}
        timelineHeight={canvasHeight - canvasPadding}
        {now}
        {startTime}
        {endTime}
        {duration}
      />
      {#each deployment as step, index (step.id)}
        <DeploymentGraphRow
          {step}
          {canvasWidth}
          {duration}
          {startTime}
          y={index * height + height}
        />
      {/each}
    </svg>
  </div>
</DeploymentInterval>
