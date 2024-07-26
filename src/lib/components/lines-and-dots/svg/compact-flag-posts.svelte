<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import { CompactConfig } from '../constants';

  const { radius, height: blockHeight } = CompactConfig;

  export let canvasHeight: number;
  export let status: WorkflowStatus;

  const width = radius * 1.5;
  const height = radius * 1.5;
</script>

<Icon
  name="flag"
  x={radius / 2}
  y={radius / 2}
  width={48}
  height={48}
  class="text-white"
/>
<line
  x1={radius}
  x2={radius}
  y1={radius}
  y2={canvasHeight - 2 * radius}
  class="start"
/>
{#if status === 'Running'}
  <Icon
    name="spinner"
    x={radius + 3}
    y={canvasHeight - 1.5 * blockHeight}
    width={24}
    height={24}
    class="animate-spin text-white"
  />
{:else}
  <rect
    x={radius - 1}
    y={canvasHeight - 1.5 * blockHeight}
    {width}
    {height}
    class={status}
  />
{/if}

<style lang="postcss">
  .start {
    stroke: #444ce7;
    fill: #444ce7;
    stroke-width: 3;
  }

  .Completed {
    stroke: #aeffd7;
    fill: #aeffd7;
  }

  .Failed {
    stroke: #ffc3a8;
    fill: #ffc3a8;
  }

  .Signaled {
    stroke: #d300d8;
    fill: #d300d8;
  }

  .TimedOut {
    stroke: #f97316;
    fill: #f97316;
  }

  .Canceled {
    stroke: #c9d8f0;
    fill: #c9d8f0;
  }

  .Terminated {
    stroke: #fde989;
    fill: #fde989;
  }

  .Running {
    fill: #3b82f6;
    stroke: #3b82f6;
  }
</style>
