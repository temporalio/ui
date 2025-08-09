<script lang="ts">
  import { onMount } from 'svelte';

  let props = $props();

  let { steps } = props;
  let step = $state(0);
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      if (step < steps.length - 1) {
        step += 1;
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<svg
  viewBox="0 0 100 100"
  width="400"
  height="400"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M 32 45 C 2 30, 98 30, 68 45"
    stroke-width="3"
    fill="transparent"
    class={steps[step]?.class || 'running'}
  />
  <text
    x="35"
    y="49"
    textLength="30"
    dominant-baseline="top"
    lengthAdjust="spacingAndGlyphs"
    style="transform-origin: 32px 45px; transform: scaleY(.8);"
    class="font-mono"
  >
    {steps[step]?.label || ''}
  </text>
</svg>

<style>
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

  .child {
    stroke: #67e4f9;
  }

  .completed {
    stroke: #00964e;
  }

  .failed,
  .terminated {
    stroke: #c71607;
  }

  .signaled {
    stroke: #d300d8;
  }

  .fired {
    stroke: #f8a208;
  }

  .timed-out {
    stroke: #f97316;
  }

  .canceled {
    stroke: #fed64b;
  }

  .running {
    stroke: #3b82f6;
  }

  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  .retried {
    stroke: url('#retried-pattern');
    opacity: 0.85;
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
