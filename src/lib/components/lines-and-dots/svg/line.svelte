<script lang="ts">
  type Props = {
    startPoint?: [number, number];
    endPoint?: [number, number];
    status?: string;
    category?: string;
    classification?: string;
    scheduling?: boolean;
    pending?: boolean;
    paused?: boolean;
    retried?: boolean;
    strokeWidth?: number;
    strokeDasharray?: string;
    delayed?: boolean;
  };

  let {
    startPoint = [0, 1000],
    endPoint = [0, 1000],
    status = undefined,
    category = undefined,
    classification = undefined,
    scheduling = false,
    pending = false,
    paused = false,
    retried = false,
    strokeWidth = 2,
    strokeDasharray = 'none',
    delayed = false,
  }: Props = $props();

  const [x1, y1] = $derived(startPoint);
  const [x2, y2] = $derived(endPoint);
  const completedWithRetries = $derived(
    retried && classification === 'Completed',
  );
</script>

{#if completedWithRetries}
  <foreignObject
    x={x1}
    y={y1 - strokeWidth / 2}
    width={x2 - x1}
    height={strokeWidth}
  >
    <div
      class="h-full w-full"
      style="background: linear-gradient(255deg, #1FF1A5 0%, #F55 100%);"
    ></div>
  </foreignObject>
{:else}
  <line
    class="line {status} {category} {classification}"
    class:scheduling
    class:animate-line={pending && !paused}
    class:delayed
    stroke-width={strokeWidth}
    stroke-dasharray={pending ? '3' : strokeDasharray}
    x1={Math.max(0, x1)}
    x2={Math.max(0, x2)}
    {y1}
    {y2}
  />
{/if}

<style lang="postcss">
  .line {
    cursor: pointer;
    opacity: 1;
    outline: none;
    stroke: currentColor;
  }

  .none {
    stroke: #141414;
    opacity: 0.65;
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
    stroke: theme('colors.red.300');
  }

  .child-workflow {
    stroke: theme('colors.cyan.600');
  }

  .Completed {
    stroke: #1ff1a5;
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
    stroke: #f97316;
  }

  .Canceled {
    stroke: #fed64b;
  }

  .Running {
    stroke: #3b82f6;

    &.delayed {
      stroke: #fbbf24;
    }
  }

  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 200;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
</style>
