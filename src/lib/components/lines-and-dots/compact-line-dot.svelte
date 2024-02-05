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
  export let canvasWidth: number;
  export let startText = '';
  export let endText = '';
  export let active = false;
  export let onHover: () => void;

  const r = 6;
  const strokeWidth = 2;

  $: atTheEnd = canvasWidth - x < 100;
</script>

{#if startText}
  <text x={5} y={y + 3} class="text">{startText}</text>
{/if}
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
{#if endText}
  <text
    x={atTheEnd ? x - 100 : x + r + 5}
    y={atTheEnd ? y + 14 : y + 3}
    textLength={atTheEnd ? 100 : 'none'}
    class="text">{endText}</text
  >
{/if}

<style lang="postcss">
  .line {
    opacity: 0.1;
  }

  .text {
    fill: white;
    font-size: 10px;
  }

  .dot {
    fill: #2d323e;
    opacity: 0.1;
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
