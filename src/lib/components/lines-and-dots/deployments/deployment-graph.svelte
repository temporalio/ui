<script lang="ts">
  import { deployment } from './deployments';
  import { TimelineConfig } from '../constants';
  import Line from '../svg/line.svelte';
  import TimelineAxis from '../svg/timeline-axis.svelte';

  import DeploymentGraphRow from './deployment-graph-row.svelte';
  import DeploymentInterval from './deployment-interval.svelte';

  export let x = 0;
  export let y = 0;

  let canvasWidth: number = 1000;
  let canvasHeight: number = 800;

  const { height, gutter, radius } = TimelineConfig;

  console.log(deployment);
</script>

<div class="surface-black h-full w-full pt-12" bind:clientWidth={canvasWidth}>
  <DeploymentInterval
    {deployment}
    let:startTime
    let:endTime
    let:duration
    let:durationToNow
  >
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
    >
      <Line
        startPoint={[gutter, 0]}
        endPoint={[gutter, canvasHeight - 200]}
        strokeWidth={radius / 2}
      />
      <Line
        startPoint={[canvasWidth - gutter, 0]}
        endPoint={[canvasWidth - gutter, canvasHeight - 200]}
        strokeWidth={radius / 2}
      />
      <TimelineAxis
        x1={gutter - radius / 4}
        x2={canvasWidth - gutter + radius / 4}
        {canvasWidth}
        timelineHeight={canvasHeight - 200}
        {startTime}
        {endTime}
        {duration}
        {durationToNow}
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
  </DeploymentInterval>
</div>
