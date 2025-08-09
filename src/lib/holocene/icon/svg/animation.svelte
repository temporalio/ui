<script lang="ts">
  import { onMount } from 'svelte';

  let props = $props();

  let { steps } = props;
  let step = $state(0);
  let interval;

  // Color mapping for each step class
  const colorMap = {
    workflow: '#ebebeb',
    marker: '#ebebeb',
    command: '#ebebeb',
    timer: '#fbbf24',
    signal: '#d300d8',
    activity: '#a78bfa',
    pending: '#a78bfa',
    retry: '#f87171',
    child: '#67e4f9',
    completed: '#00964e',
    failed: '#c71607',
    terminated: '#c71607',
    signaled: '#d300d8',
    fired: '#f8a208',
    'timed-out': '#f97316',
    canceled: '#fed64b',
    running: '#3b82f6',
  };

  // Generate gradient stops based on current step
  const gradientStops = $derived.by(() => {
    const currentSteps = steps.slice(0, step + 1);
    return currentSteps.map((stepItem, index) => {
      const color = colorMap[stepItem.class] || '#3b82f6';
      const percentage = (index / Math.max(currentSteps.length - 1, 1)) * 100;
      return { color, percentage };
    });
  });

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
  <defs>
    <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      {#each gradientStops as stop}
        <stop offset="{stop.percentage}%" stop-color={stop.color} />
      {/each}
    </linearGradient>
  </defs>
  <path
    d="M 32 45 C 2 30, 98 30, 68 45"
    stroke-width="3"
    fill="transparent"
    stroke="url(#stepGradient)"
  />
  <text
    x="35"
    y="48"
    textLength="30"
    font-size="11"
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
