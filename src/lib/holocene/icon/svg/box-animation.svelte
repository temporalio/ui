<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

  import Icon from '../icon.svelte';
  import { type IconName } from '../paths';

  type Props = {
    groups: EventGroups;
    onClick: (group: EventGroup) => void;
  };
  let { groups, onClick }: Props = $props();

  const height = 24;
  const mid = height / 2;
  const fullWidth = $derived(100 / groups.length);
  const blockWidth = $derived(fullWidth * 1);
  const blockOffset = $derived(fullWidth * 0.0);
</script>

{#snippet icon(name: IconName, x: number, y: number)}
  <g
    transform={`translate(${x + blockWidth / 2 - 1.125}, ${y + 0.9}) scale(0.75)`}
  >
    <Icon width={3} height={3} {name} />
  </g>
{/snippet}

{#snippet signal(_group: EventGroup, index: number)}
  {@const start = index * fullWidth + blockOffset}
  {@const x = start + blockWidth / 2}
  {@const y = mid + 4}
  <rect
    x={start}
    y={mid - 5}
    width={blockWidth}
    height="4"
    fill="transparent"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('json', start, mid - 5)}
  <path
    d={`M ${x} ${y} L ${x} ${y - 3} M ${x - 0.5} ${y - 2} L ${x} ${y - 3} L ${x + 0.5} ${y - 2}`}
    stroke-width=".25"
    stroke="#d300d8"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
{/snippet}

{#snippet update(_group: EventGroup, index: number)}
  {@const start = index * fullWidth + blockOffset}
  {@const x = start + blockWidth / 2}
  {@const y = mid + 4}
  <rect
    x={start}
    y={mid - 5}
    width={blockWidth}
    height="4"
    fill="transparent"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('json', start, mid - 5)}
  <path
    d={`M ${x} ${y} L ${x} ${y - 3} M ${x - 0.5} ${y - 2} L ${x} ${y - 3} L ${x + 0.5} ${y - 2}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d={`M ${x + 1.5} ${y - 3} L ${x + 1.5} ${y} M ${x + 0.5} ${y - 1} L ${x + 1.5} ${y} L ${x + 2.5} ${y - 1}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
{/snippet}

{#snippet activity(group: EventGroup, index: number)}
  {@const x = index * fullWidth + blockOffset}
  {@const y = mid - 5}
  {@const attempts = group.eventList[1]?.attributes?.attempt ?? 0}
  {@const retried = attempts > 1}
  {@const pending = group.isPending}
  <defs>
    <linearGradient id="redToGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c71607" />
      <stop offset="60%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <rect
    {x}
    {y}
    width={blockWidth}
    height="4"
    stroke="#374151"
    stroke-width=".15"
    fill={retried
      ? 'url(#redToGreenGradient)'
      : pending
        ? '#a78bfa'
        : '#10b981'}
    filter="url(#subtle-shadow)"
  />
  {@render icon('toolbox', x, y)}
  {#if pending}
    <line
      x1={x + blockWidth / 2}
      y1={y}
      x2={x + blockWidth / 2}
      y2={y - 2.5}
      stroke="#64748b"
      stroke-width=".25"
      stroke-dasharray=".5"
      stroke-linecap="round"
      class="retried"
    />
    <g transform={`translate(${x + blockWidth / 2 - 1.5}, ${y - 5.5})`}>
      <Icon width={3} height={3} name="robot" />
    </g>
  {/if}
  {#if attempts > 1}
    <text
      x={x + blockWidth / 2}
      y={mid - 5.5}
      text-anchor="middle"
      font-size="1px"
      font-weight="bold"
      fill="#374151"
    >
      {attempts}x
    </text>
  {/if}
{/snippet}

{#snippet child(group: EventGroup, index: number)}
  {@const x = index * fullWidth + blockOffset}
  {@const y = mid - 5}
  {@const status = group.finalClassification}

  <rect
    {x}
    {y}
    width={blockWidth}
    height="4"
    fill={status === 'Failed'
      ? 'red'
      : status === 'Completed'
        ? '#10b981'
        : 'oklch(86.5% 0.127 207.078)'}
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('relationship', x, y)}
  {#if true}
    <path
      d={`M ${x + blockWidth / 2} ${y + 4} L ${x + blockWidth / 2} ${y + 12} C ${x + blockWidth / 2 + 20} ${y + 12}, ${100 - x} ${y + 12}, 100 ${y + 12}`}
      stroke="#64748b"
      stroke-width=".25"
      stroke-dasharray=".5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  {/if}
{/snippet}

{#snippet timer(group: EventGroup, index: number)}
  {@const x = index * fullWidth + blockOffset}
  {@const y = mid - 5}
  {@const duration = formatDistanceAbbreviated({
    start: group?.initialEvent?.eventTime,
    end: group?.lastEvent?.eventTime,
  })}
  <rect
    {x}
    y={mid - 5}
    width={blockWidth}
    height="4"
    fill="#f59e0b"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('retention', x, y)}
  {#if duration}
    <text
      x={x + blockWidth / 2}
      y={mid - 5.5}
      text-anchor="middle"
      font-size="1px"
      font-weight="bold"
      fill="#374151"
    >
      {duration}
    </text>
  {/if}
{/snippet}

{#snippet marker(_group: EventGroup, index: number)}
  {@const x = index * fullWidth + blockOffset}
  {@const y = mid - 5}
  <rect
    {x}
    y={mid - 5}
    width={blockWidth}
    height="4"
    fill="#9ca3af"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('marker', x, y)}
{/snippet}

{#snippet renderStep(group, index)}
  {@const delay = Math.min(1000 / groups.length, 150) * index}
  {@const type = group.category.split('-')[0].toLowerCase()}
  <g
    class="fly-in"
    style="animation-delay: {delay}ms;"
    onclick={() => onClick(group)}
  >
    {#if type === 'signal'}
      {@render signal(group, index)}
    {:else if type === 'update'}
      {@render update(group, index)}
    {:else if isActivityTaskScheduledEvent(group.initialEvent)}
      {@render activity(group, index)}
    {:else if type === 'timer'}
      {@render timer(group, index)}
    {:else if type === 'child'}
      {@render child(group, index)}
    {:else if type === 'other'}
      {@render marker(group, index)}
    {/if}
  </g>
{/snippet}

<svg viewBox="-1 0 101 {height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="subtle-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" flood-opacity="0.15" />
    </filter>
  </defs>
  <line
    x1="0"
    y1={mid}
    x2="100"
    y2={mid}
    stroke-width="1"
    stroke="#374151"
    stroke-linecap="round"
  />
  {#each groups as group, index}
    {@render renderStep(group, index)}
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

  .retried {
    opacity: 0.85;
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

  /* Professional enterprise styling */
  svg {
    overflow: visible;
  }

  rect {
    transition: all 0.2s ease-in-out;
  }

  rect:hover {
    filter: url("#subtle-shadow") brightness(1.15);
  }
</style>
