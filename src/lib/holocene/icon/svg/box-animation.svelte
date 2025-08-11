<script lang="ts">
  import { onMount } from 'svelte';

  import Icon from '../icon.svelte';

  type Props = {
    steps: string[];
    animate?: boolean;
    delay?: number;
  };
  let { steps, animate = true, delay = 500 }: Props = $props();
  let step = $state(animate ? 0 : steps.length - 1);
  let interval;
  const height = 30;
  const mid = height / 2;

  onMount(() => {
    interval = setInterval(() => {
      if (step < steps.length - 1) {
        step += 1;
      }
    }, delay);

    return () => clearInterval(interval);
  });
</script>

{#snippet signal(index: number, width: number)}
  {@const start = index * width}
  {@const x = start + width / 2}
  {@const y = mid + 5}
  <rect
    x={start}
    y={mid - 5}
    {width}
    height="4"
    fill="transparent"
    stroke="#d300d8"
    stroke-width=".15"
  />
  <path
    d={`M ${x} ${y} L ${x} ${y - 4} M ${x - 1} ${y - 3} L ${x} ${y - 4} L ${x + 1} ${y - 3}`}
    stroke-width=".25"
    stroke="#d300d8"
    fill="none"
  />
{/snippet}

{#snippet update(index: number, width: number)}
  {@const start = index * width}
  {@const x = start + width / 2}
  {@const y = mid + 5}
  <rect
    x={start}
    y={mid - 5}
    {width}
    height="4"
    fill="transparent"
    stroke="purple"
    stroke-width=".15"
  />
  <path
    d={`M ${x} ${y} L ${x} ${y - 4} M ${x - 1} ${y - 3} L ${x} ${y - 4} L ${x + 1} ${y - 3}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
  />
  <path
    d={`M ${x + 1.5} ${y - 4} L ${x + 1.5} ${y} M ${x + 0.5} ${y - 1} L ${x + 1.5} ${y} L ${x + 2.5} ${y - 1}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
  />
{/snippet}

{#snippet activity(index: number, width: number)}
  {@const x = index * width}
  {@const y = mid - 5}
  {@const pending = index % 3 === 0}
  <rect
    {x}
    {y}
    {width}
    height="4"
    stroke="black"
    stroke-width=".15"
    fill={pending ? 'lightgreen' : '#00964e'}
  />
  <g transform={`translate(${x + width / 3}, ${y + 0.75}) scale(0.75)`}>
    <Icon width={3} height={3} name="toolbox" />
  </g>
  {#if pending}
    <line
      x1={x + width / 2}
      y1={y}
      x2={x + width / 2}
      y2={y - 4}
      stroke="black"
      stroke-width=".25"
      stroke-dasharray=".5"
    />
    <g transform={`translate(${x + width / 4.5}, ${y - 6})`}>
      <Icon width={3} height={3} name="robot" />
    </g>
  {/if}
{/snippet}

{#snippet child(index: number, width: number)}
  {@const x = index * width}
  {@const y = mid - 5}
  <rect
    {x}
    {y}
    {width}
    height="4"
    fill="#67e4f9"
    stroke="black"
    stroke-width=".15"
  />
  <g transform={`translate(${x + width / 3}, ${y + 0.75}) scale(0.75)`}>
    <Icon width={3} height={3} name="relationship" />
  </g>
  {#if true}
    <path
      d={`M ${x + width / 2} ${y + 4} L ${x + width / 2} ${y + 12} C ${x + width / 2 + 20} ${y + 12}, ${100 - 20} ${y + 12}, 100 ${y + 12}`}
      stroke="black"
      stroke-width=".25"
      stroke-dasharray=".5"
      fill="none"
    />
  {/if}
{/snippet}

{#snippet timer(index: number, width: number)}
  {@const x = index * width}
  {@const y = mid - 5}

  <rect
    {x}
    y={mid - 5}
    {width}
    height="4"
    fill="#fbbf24"
    stroke="black"
    stroke-width=".15"
  />
  <g transform={`translate(${x + width / 3}, ${y + 0.75}) scale(0.75)`}>
    <Icon width={3} height={3} name="retention" />
  </g>
{/snippet}

{#snippet marker(index: number, width: number)}
  {@const x = index * width}
  <rect
    {x}
    y={mid - 5}
    {width}
    height="4"
    fill="grey"
    stroke="black"
    stroke-width=".15"
  />
{/snippet}

{#snippet renderStep(type, index)}
  {@const width = 100 / steps.length}
  {@const delay = (1000 / steps.length) * index}
  <g class="fly-in" style="animation-delay: {delay}ms;">
    {#if type === 'signal'}
      {@render signal(index, width)}
    {:else if type === 'update'}
      {@render update(index, width)}
    {:else if type === 'activity'}
      {@render activity(index, width)}
    {:else if type === 'timer'}
      {@render timer(index, width)}
    {:else if type === 'child'}
      {@render child(index, width)}
    {:else if type === 'marker'}
      {@render marker(index, width)}
    {/if}
  </g>
{/snippet}

<svg viewBox="-1 0 101 {height}" xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1={mid} x2="100" y2={mid} stroke-width="1" stroke="black" />
  {#each steps as step, index}
    {@render renderStep(step, index)}
  {/each}
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

  @keyframes flyIn {
    0% {
      transform: translateX(-10px) scale(0.95);
      opacity: 0;
    }

    50% {
      transform: translateX(2px) scale(1.05);
    }

    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  .fly-in {
    animation: flyIn 0.3s cubic-bezier(0.24, 1.36, 0.44, 1) both;
  }
</style>
