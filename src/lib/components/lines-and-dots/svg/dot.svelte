<script lang="ts">
  import type { Snippet } from 'svelte';

  import { HistoryConfig } from '../constants';

  import TimelineIcon, { type TimelineIconName } from './timeline-icon.svelte';

  const { radius } = HistoryConfig;

  type Props = {
    point: [number, number];
    category?: string;
    classification?: string | null;
    r?: number;
    icon?: TimelineIconName;
    strokeWidth?: number;
    children?: Snippet;
  };

  let {
    point,
    category = undefined,
    classification = undefined,
    r = radius,
    icon = undefined,
    strokeWidth = 2,
    children,
  }: Props = $props();

  // PERF: The previous approach used class names (.Started, .Completed, .activity …)
  // and ~18 scoped CSS selectors. The browser checks every selector against every
  // dot element on each style recalculation — with 94k+ elements × 18 selectors
  // this was ~1.7M selector evaluations per recalc (visible in CSS selector stats).
  //
  // Fix: compute fill/stroke in JS and write a single `style` attribute per rect.
  // The stylesheet is reduced to two structural rules (.dot, g), so the selector
  // engine has almost nothing to evaluate for these elements.
  type ColorPair = readonly [fill: string, stroke: string];

  const DEFAULT: ColorPair = ['#e8efff', '#141414'];

  const CLASSIFICATION_COLORS: Record<string, ColorPair> = {
    Started: ['#92a4c3', '#141414'],
    Completed: ['#1ff1a5', '#00964e'],
    Fired: ['#f8a208', '#fed64b'],
    Signaled: ['#d300d8', '#ff26ff'],
    Failed: ['#f55', '#c71607'],
    Terminated: ['#f55', '#c71607'],
    TimedOut: ['#c2570c', '#f97316'],
    Canceled: ['#fed64b', '#fff4c6'],
  };

  const CATEGORY_COLORS: Record<string, ColorPair> = {
    marker: ['#ebebeb', '#141414'],
    command: ['#ebebeb', '#141414'],
    timer: ['#fbbf24', '#141414'],
    signal: ['#d300d8', '#141414'],
    activity: ['#a78bfa', '#141414'],
    pending: ['#141414', '#a78bfa'],
    'child-workflow': ['#b2f8d9', '#141414'],
    update: ['#06b6d4', '#141414'],
    workflow: ['#059669', '#141414'],
  };

  const colorPair = $derived(
    (classification && CLASSIFICATION_COLORS[classification]) ||
      (category && CATEGORY_COLORS[category]) ||
      DEFAULT,
  );
</script>

<g>
  <rect
    class="dot"
    style="fill:{colorPair[0]};stroke:{colorPair[1]}"
    stroke-width={strokeWidth}
    x={point[0] - r}
    y={point[1] - r}
    width={r * 2}
    height={r * 2}
    rx={r * 0.3}
  >
    {@render children?.()}
  </rect>
  {#if icon}
    <TimelineIcon
      name={icon}
      x={point[0] - r / 2}
      y={point[1] - r / 2}
      width={r}
      height={r}
      style="color:#000"
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
  }
</style>
