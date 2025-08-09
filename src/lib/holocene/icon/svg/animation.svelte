<script lang="ts">
  import { onMount } from 'svelte';

  type Step = {
    class: string;
    label: string;
    count?: number;
  };
  type Props = {
    steps: Step[];
    animate?: boolean;
    delay?: number;
    showCounts?: boolean;
  };
  let props: Props = $props();

  let { steps, animate = true, delay = 500, showCounts = true } = props;
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

  // Calculate positions for count labels along the path
  const countPositions = $derived.by(() => {
    const currentSteps = steps.slice(0, step + 1);
    return currentSteps
      .map((stepItem, index) => {
        if (!stepItem.count) return null;

        // Calculate position along the straight line from (32,45) to (68,45)
        const t =
          currentSteps.length === 1 ? 0.5 : index / (currentSteps.length - 1);

        // Linear interpolation between start and end points
        const x = 32 + (68 - 32) * t;
        const y = 45;

        return {
          x,
          y: y - 14, // Position above the path
          count: stepItem.count,
        };
      })
      .filter(Boolean);
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
    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.2" />
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle
    cx="50"
    cy="40"
    r="30"
    fill="white"
    stroke="#f3f4f6"
    stroke-width="1"
    filter="url(#dropShadow)"
  />
  <path
    d="M 32 45 C 2 30, 98 30, 68 45"
    stroke-width="3"
    fill="transparent"
    stroke="url(#stepGradient)"
    filter="url(#glow)"
  />
  <text
    x="50"
    y="45"
    text-anchor="middle"
    dominant-baseline="middle"
    font-size="9"
    textLength="24"
    lengthAdjust="spacingAndGlyphs"
    class="font-mono font-bold"
    fill="#1f2937"
  >
    {steps[step]?.label || ''}
  </text>

  {#if showCounts}
    <!-- Count labels with background for better readability -->
    {#each countPositions as position}
      <g transform="rotate(-75, {position.x}, {position.y})">
        <text
          x={position.x}
          y={position.y}
          text-anchor="start"
          dominant-baseline="middle"
          font-size="2.5"
          class="font-mono font-semibold"
        >
          {position.count}x
        </text>
      </g>
    {/each}
  {/if}
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
