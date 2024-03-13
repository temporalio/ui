<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import { HistoryConfig } from '../constants';

  const { radius } = HistoryConfig;

  export let startPoint = [0, 1000];
  export let endPoint = [0, 1000];
  export let status: WorkflowStatus | 'none' = 'none';
  export let category: EventTypeCategory | 'pending' | 'retry' | 'none' =
    'none';
  export let classification: EventClassification | undefined = undefined;
  export let active = true;
  export let scheduling = false;
  export let strokeWidth: number = radius / 2;
  export let strokeDasharray = 'none';

  $: [x1, y1] = startPoint;
  $: [x2, y2] = endPoint;
</script>

<line
  class="line {status} {category} {classification}"
  class:active
  class:scheduling
  stroke-width={strokeWidth}
  stroke-dasharray={strokeDasharray}
  {x1}
  {x2}
  {y1}
  {y2}
/>

<style lang="postcss">
  .line {
    cursor: pointer;
    opacity: 0.15;
    outline: none;
  }

  .active {
    opacity: 1;
  }

  .scheduling {
    opacity: 0.35;
  }

  .none {
    stroke: #ebebeb;
  }

  .marker,
  .command {
    stroke: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
  }

  .signal {
    stroke: #ec4899;
  }

  .activity {
    stroke: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
    stroke-dasharray: 1;
  }

  .retry {
    stroke: #ff4518;
    stroke-dasharray: 2;
  }

  .child-workflow {
    stroke: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
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
