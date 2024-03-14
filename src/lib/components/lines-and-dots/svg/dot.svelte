<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  import { HistoryConfig } from '../constants';

  const { radius } = HistoryConfig;

  export let point: [number, number];
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;
  export let active = false;
  export let r = radius;

  $: [x, y] = point;
  const strokeWidth = r / 3;
</script>

<g>
  <circle
    class="dot {category} {classification}"
    class:active
    stroke-width={strokeWidth}
    cx={x}
    cy={y}
    {r}
  >
    <slot />
  </circle>
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
    stroke: #141414;
    fill: #ebebeb;
  }

  .timer {
    stroke: #141414;
    fill: #fbbf24;
  }

  .signal {
    stroke: #141414;
    fill: #ec4899;
  }

  .activity {
    stroke: #141414;
    fill: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
    fill: #141414;
  }

  .child-workflow {
    stroke: #141414;
    fill: #b2f8d9;
  }

  .workflow {
    stroke: #141414;
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
