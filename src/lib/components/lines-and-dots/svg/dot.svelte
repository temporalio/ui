<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  import { HistoryConfig } from '../constants';

  export let point: [number, number];
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;
  export let active = false;

  $: [x, y] = point;
  const { radius } = HistoryConfig;
  const strokeWidth = radius / 2;
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
    r={radius}
  />
</g>

<style lang="postcss">
  g {
    outline: none;
  }

  .dot {
    cursor: pointer;
    outline: none;
    fill: #141414;
    opacity: 0.5;
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

  .activity {
    stroke: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
    stroke-dasharray: 1;
  }

  .child-workflow {
    stroke: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
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
