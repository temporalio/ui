<script lang="ts">
  import type { WorkflowStatus } from '$lib/types/workflows';

  export let x1 = 0;
  export let x2 = 1000;
  export let y1 = 0;
  export let y2 = 1000;
  export let status: WorkflowStatus | 'none' = 'none';

  const strokeWidth = 4;
</script>

<line class="line {status}" stroke-width={strokeWidth} {x1} {x2} {y1} {y2} />

<style lang="postcss">
  line {
    stroke: #141414;
    fill: #141414;
  }

  .Completed {
    stroke: #059669;
    fill: #059669;
  }

  .Failed,
  .Terminated {
    fill: #ff4518;
    stroke: #ff4518;
  }

  .TimedOut {
    fill: #f88f49;
    stroke: #f88f49;
  }

  .Canceled {
    fill: #fff3c6;
    stroke: #fff3c6;
  }

  .Running {
    stroke: #3b82f6;
    fill: #3b82f6;
  }
</style>
