<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  import { startingX } from './history-graph.svelte';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let nextDistance = 0;
  export let offset = 1;
  export let connectLine = true;
  export let active = false;
  export let onHover: () => void;

  const r = 6;
  const x = startingX;
  const strokeWidth = 2;
  $: horizontalOffset = category === 'workflow' ? 0 : (offset / 1.5) * 3 * r;
</script>

{#if category !== 'workflow' && connectLine}
  <line
    class="line {category}"
    class:active
    stroke-width={strokeWidth}
    x1={x}
    x2={x + horizontalOffset - r}
    y1={y}
    y2={y}
    on:mouseover={onHover}
    on:focus={onHover}
  />
{/if}
<g>
  {#if category === 'pending'}
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from="0 {x + horizontalOffset} {y}"
      to="360 {x + horizontalOffset} {y}"
      dur="2s"
      repeatCount="indefinite"
    />
  {/if}
  <circle
    class="dot {category} {classification}"
    class:active
    stroke-width={strokeWidth}
    cx={x + horizontalOffset}
    cy={y}
    {r}
    on:mouseover={onHover}
    on:focus={onHover}
  />
</g>
{#if nextDistance}
  <line
    class="line {category}"
    class:active
    stroke-width={strokeWidth}
    x1={x + horizontalOffset + r / 2 - strokeWidth}
    x2={x + horizontalOffset + r / 2 - strokeWidth}
    y1={y + r}
    y2={y + nextDistance - r}
    on:mouseover={onHover}
    on:focus={onHover}
  />
{/if}

<style lang="postcss">
  .line {
    opacity: 0.35;
  }

  .dot {
    fill: #2d323e;
    opacity: 0.35;
  }

  .pending {
    stroke-dasharray: 2;
  }

  .active {
    opacity: 1;
  }

  .marker,
  .command {
    stroke: #ebebeb;
    fill: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
    fill: #fbbf24;
  }

  .signal {
    stroke: #ec4899;
    fill: #ec4899;
  }

  .activity,
  .pending {
    stroke: #a78bfa;
    fill: #a78bfa;
  }

  .child-workflow {
    stroke: #b2f8d9;
    fill: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
    fill: #059669;
  }

  .Failed,
  .Terminated {
    fill: #ff4518;
  }

  .TimedOut {
    fill: #f88f49;
  }

  .Canceled {
    fill: #fff3c6;
  }
</style>
