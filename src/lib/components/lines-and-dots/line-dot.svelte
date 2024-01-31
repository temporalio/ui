<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  export let y: number = 20;
  export let category: EventTypeCategory;
  export let nextDistance = 0;
  export let offset = 1;
  export let connectLine = true;
  export let active = false;
  export let onHover: () => void;
  export let onHoverLeave: () => void;

  const r = 6;
  const x = 20;
  const strokeWidth = 2;
  const horizontalOffset = category === 'workflow' ? 0 : (offset / 1.5) * 3 * r;
</script>

{#if category !== 'workflow' && connectLine}
  <line
    class="line {category}"
    class:active
    stroke-width={strokeWidth}
    x1={x}
    x2={x + horizontalOffset}
    y1={y}
    y2={y}
    on:mouseover={onHover}
    on:focus={onHover}
    on:mouseleave={onHoverLeave}
  />
{/if}
<circle
  stroke-width={strokeWidth}
  class="dot {category}"
  class:active
  cx={x + horizontalOffset}
  cy={y}
  {r}
  on:mouseover={onHover}
  on:focus={onHover}
  on:mouseleave={onHoverLeave}
/>
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
    on:mouseleave={onHoverLeave}
  />
{/if}

<style lang="postcss">
  .line {
    fill: #10172a;
    opacity: 0.35;
  }

  .dot {
    opacity: 0.35;
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

  .child-workflow {
    stroke: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
    fill: #059669;
  }
</style>
