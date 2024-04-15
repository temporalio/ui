<script lang="ts">
  import { HistoryConfig } from '../constants';

  const { radius } = HistoryConfig;

  export let point: [number, number];
  export let category: string | undefined = undefined;
  export let classification: string | undefined = undefined;
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
    fill: #ebebeb;
  }

  .timer {
    fill: #fbbf24;
  }

  .signal {
    fill: #d300d8;
  }

  .activity {
    fill: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
    fill: #141414;
  }

  .child-workflow {
    fill: #b2f8d9;
  }

  .update {
    fill: #06b6d4;
  }

  .workflow {
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
