<script lang="ts">
  import { onMount } from 'svelte';

  let props = $props();

  let { steps, animate = true, delay = 500 } = props;
  let step = $state(animate ? 0 : steps.length - 1);
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

  // Generate gradient stops based on current step with hard stops
  const gradientStops = $derived.by(() => {
    const currentSteps = steps.slice(0, step + 1);
    const stops = [];

    if (currentSteps.length === 1) {
      // Single step - use solid color
      const color = colorMap[currentSteps[0].class] || '#3b82f6';
      stops.push({ color, percentage: 0 });
      stops.push({ color, percentage: 100 });
    } else {
      // Multiple steps - equal segments with hard boundaries
      const segmentSize = 100 / currentSteps.length;

      currentSteps.forEach((stepItem, index) => {
        const color = colorMap[stepItem.class] || '#3b82f6';
        const start = index * segmentSize;
        const end = (index + 1) * segmentSize;

        // Ensure first color starts at 0% and last color ends at 100%
        const actualStart = index === 0 ? 0 : start;
        const actualEnd = index === currentSteps.length - 1 ? 100 : end;

        stops.push({ color, percentage: actualStart });
        stops.push({ color, percentage: actualEnd });
      });
    }

    return stops;
  });

  onMount(() => {
    interval = setInterval(() => {
      if (step < steps.length - 1) {
        step += 1;
      }
    }, delay);

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
    <linearGradient
      id="stepGradient"
      x1="32"
      y1="45"
      x2="68"
      y2="45"
      gradientUnits="userSpaceOnUse"
    >
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
