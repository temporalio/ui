<script lang="ts">
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';

  import { HistoryConfig } from '../constants';

  const { radius } = HistoryConfig;

  export let point: [number, number];
  export let category: EventTypeCategory | 'pending' | undefined = undefined;
  export let classification: EventClassification | undefined = undefined;
  export let active = false;
  export let r = radius;

  $: [x, y] = point;

  const strokeWidth = 3;
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
    opacity: 0.5;
    stroke: #141414;
    fill: #e8efff;
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
    fill: #d300d8;
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

  .update {
    stroke: #141414;
    fill: #06b6d4;
  }

  .workflow {
    stroke: #141414;
    fill: #059669;
  }

  .Started {
    fill: #92a4c3;
  }

  .Completed {
    stroke: #00964e;
    fill: #00f37e;
  }

  .Fired {
    stroke: #fed64b;
    fill: #f8a208;
  }

  .Signaled {
    stroke: #ff26ff;
    fill: #d300d8;
  }

  .Failed,
  .Terminated {
    stroke: #c71607;
    fill: #ff4518;
  }

  .TimedOut {
    stroke: #f97316;
    fill: #c2570c;
  }

  .Canceled {
    stroke: #fff4c6;
    fill: #fed64b;
  }
</style>
