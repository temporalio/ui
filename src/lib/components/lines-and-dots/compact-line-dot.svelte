<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let group: EventGroup;
  export let x = 0;
  export let nextX = 0;
  export let canvasWidth: number;
  export let active = false;
  export let onClick: () => void;
  export let showText = false;

  const r = 3;
  const strokeWidth = 6;

  $: atTheEnd = canvasWidth - x < 100;
</script>

<g on:click={onClick} on:keydown={onClick}>
  {#if nextX}
    <line
      class="line {category}"
      class:active
      stroke-width={strokeWidth}
      x1={x + r}
      x2={x + nextX - r}
      y1={y}
      y2={y}
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
      stroke-width={category === 'pending' ? strokeWidth * 2 : strokeWidth}
      cx={x}
      cy={y}
      {r}
    />
  </g>
  {#if showText}
    <text
      x={atTheEnd ? x + r : x + 2 * r}
      text-anchor={atTheEnd ? 'end' : 'start'}
      y={atTheEnd ? y + r * 6 : y + r}
      class="text"
      class:active>{group?.name}</text
    >
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }

  .line,
  .dot,
  .text {
    cursor: pointer;
    opacity: 0.25;
    outline: none;
  }

  .text {
    fill: white;
    font-size: 16px;
  }

  .dot {
    fill: #2d323e;
    z-index: 2;
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

  .pending {
    stroke-dasharray: 1;
    fill: none;
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
    stroke: #ff4518;
  }

  .TimedOut {
    fill: #f88f49;
    stroke: #f88f49;
  }

  .Canceled {
    fill: #fff3c6;
    stroke: #fff3c6;
  }
</style>
