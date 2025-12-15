<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { HistoryConfig } from '../constants';

  const { radius } = HistoryConfig;

  export let point: [number, number];
  export let category: string | undefined = undefined;
  export let classification: string | undefined = undefined;
  export let r = radius;
  export let icon: IconName | undefined = undefined;
  export let strokeWidth = 2;

  $: [x, y] = point;
</script>

<g>
  <rect
    class="dot {category} {classification}"
    stroke-width={strokeWidth}
    x={x - r}
    y={y - r}
    width={r * 2}
    height={r * 2}
    rx={r * 0.3}
  >
    <slot />
  </rect>
  {#if icon}
    <Icon
      name={icon}
      x={x - r / 2}
      y={y - r / 2}
      width={r}
      height={r}
      class="text-black"
    />
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }

  .dot {
    cursor: pointer;
    outline: none;
    opacity: 1;
    stroke: #141414;
    fill: #e8efff;
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
    fill: #1ff1a5;
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
    fill: #f55;
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
