<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let x = 0;
  export let nextX = 0;
  export let active = false;
  export let onHover: () => void;

  const r = 6;
  const strokeWidth = 2;
</script>

<g>
  {#if category === 'pending'}
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from="0 {x} {y}"
      to="360 {x} {y}"
      dur="2s"
      repeatCount="indefinite"
    />
  {/if}
  <circle
    class="dot {category} {classification}"
    class:active
    stroke-width={strokeWidth}
    cx={x}
    cy={y}
    {r}
    on:mouseover={onHover}
    on:focus={onHover}
  />
</g>
{#if nextX}
  <line
    class="line {category}"
    class:active
    stroke-width={strokeWidth}
    x1={x + r}
    x2={x + nextX - r}
    y1={y}
    y2={y}
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
  }

  .timer {
    stroke: #fbbf24;
  }

  .signal {
    stroke: #ec4899;
  }

  .activity,
  .pending {
    stroke: #a78bfa;
  }

  .child-workflow {
    stroke: #b2f8d9;
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
