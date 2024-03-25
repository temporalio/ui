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
  export let pending = false;
  export let strokeWidth: number = radius / 2;
  export let strokeDasharray = 'none';

  $: [x1, y1] = startPoint;
  $: [x2, y2] = endPoint;
</script>

<line
  class="line {status} {category} {classification}"
  class:active
  class:scheduling
  class:animate-line={pending}
  stroke-width={strokeWidth}
  stroke-dasharray={pending ? '3' : strokeDasharray}
  x1={Math.max(0, x1)}
  x2={Math.max(0, x2)}
  {y1}
  {y2}
/>

<style lang="postcss">
  .line {
    cursor: pointer;
    opacity: 0.05;
    outline: none;
    stroke: #ebebeb;
  }

  .active {
    opacity: 1;
  }

  .scheduling {
    opacity: 0.35;
  }

  .workflow,
  .marker,
  .command {
    stroke: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
  }

  .signal {
    stroke: #d300d8;
  }

  .activity {
    stroke: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
  }

  .retry {
    stroke: #ff4518;
  }

  .child-workflow {
    stroke: #b2f8d9;
  }

  .Completed {
    stroke: #00964e;
  }

  .Failed,
  .Terminated {
    stroke: #c71607;
  }

  .Signaled {
    stroke: #d300d8;
  }

  .Fired {
    stroke: #f8a208;
  }

  .TimedOut {
    stroke: #c2570c;
  }

  .Canceled {
    stroke: #fed64b;
  }

  .Running {
    stroke: #3b82f6;
  }

  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 1000;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
</style>
